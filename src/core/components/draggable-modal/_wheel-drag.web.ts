import { useCallback, useEffect, useRef } from 'react';

import {
  beginSheetDrag,
  settleSheetDrag,
  stepSheetDrag,
  updateSheetDrag,
  type SheetDrag,
} from './_sheet-drag';
import type { TakesWheel, UseWheelDrag } from './_wheel-drag.types';

/**
 * Milliseconds of quiet that end a wheel gesture. A wheel has no release, and
 * a trackpad keeps sending events, with shrinking deltas, well after the
 * fingers leave the pad.
 */
const IDLE_TIMEOUT = 90;

/**
 * Pixels a swipe travels before it commits the sheet to the next detent. Short
 * enough that a swipe is answered at once, long enough that a nudge is not.
 */
const COMMIT_TRAVEL = 64;

/** Pixels one notch of a wheel reporting in lines stands for. */
const LINE_PIXELS = 16;

interface WheelDragSession {
  /** Whether the content under the pointer has taken this gesture. */
  declined: boolean;
  /** Whether the sheet is following the wheel, and so owes a settle. */
  dragging: boolean;
  /** Pixels followed since the sheet picked the wheel up, down positive. */
  translationY: number;
  /**
   * Sign of the travel the sheet has already been committed a detent along,
   * or `0` while it is still following.
   */
  committedDirection: number;
  idle: ReturnType<typeof setTimeout> | undefined;
}

/**
 * The session holding the wheel, if any. A drag runs the sheet out from under
 * the pointer, and what the pointer lands on — the map, most of all — must not
 * take the rest of the gesture. One wheel means one owner at a time, so this
 * is module state rather than a lock per sheet.
 */
let owner: WheelDragSession | undefined;

/**
 * The pan translation a wheel event carries. A wheel that scrolls content
 * down reads as a drag up, so the sign flips.
 *
 * @param pageHeight - Pixels a wheel reporting in pages moves by.
 */
function wheelTranslation(event: WheelEvent, pageHeight: number): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return -event.deltaY * LINE_PIXELS;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return -event.deltaY * pageHeight;
  }

  return -event.deltaY;
}

/** Settles the sheet on the nearest detent, if it is following the wheel. */
function endDrag(session: WheelDragSession, drag: SheetDrag): void {
  if (!session.dragging) return;

  session.dragging = false;

  // Nothing to project: a wheel has no release, so a swipe that has not
  // travelled far enough to commit has said all it is going to say.
  settleSheetDrag(drag, 0);
}

/** Puts the end of the gesture off by another {@link IDLE_TIMEOUT}. */
function holdGesture(session: WheelDragSession, drag: SheetDrag): void {
  clearTimeout(session.idle);

  session.idle = setTimeout(() => {
    session.idle = undefined;
    owner = undefined;

    endDrag(session, drag);
  }, IDLE_TIMEOUT);
}

/**
 * Web {@link UseWheelDrag}: the sheet follows the wheel over the view the
 * returned {@link WheelTarget} is attached to, and springs a detent along once
 * the swipe has travelled {@link COMMIT_TRAVEL}. A swipe that stops short
 * settles back on the detent it came from.
 *
 * The spring is the point. Following alone leaves the sheet wherever the
 * momentum drops it, which lands short of a detent as often as past one, so
 * the sheet is dragged rather than thrown and the swipe reads as unanswered.
 * Committing early means the sheet covers most of the gap under the spring
 * instead, and is at its detent before the momentum has finished arriving.
 *
 * A gesture is worth one detent, never two. A trackpad flick keeps sending
 * events for about a second after the fingers leave the pad, carrying several
 * times the travel that the fingers did, and a wheel event says nothing about
 * which events those are — so travel after the commit is consumed and
 * ignored, and a flick cannot run the sheet through its whole range.
 *
 * Travel the other way is let through, because momentum only ever decays and
 * never turns around: a push against the direction the sheet was committed in
 * can only be the fingers, so the sheet picks the wheel back up and follows it
 * from where it has got to. That is the one thing a wheel event does report
 * about the hand, and it costs no threshold to read.
 *
 * {@link TakesWheel} is asked on every event until it first says no, so the
 * sheet gives the wheel up the moment the rule turns — a sheet committed to
 * full height owes the rest of the swipe to the content under the pointer,
 * and the content gets it on the very next event. It is never asked again
 * after that: a flick that scrolls the content to its top would otherwise
 * have its own momentum pull the sheet closed.
 */
export const useWheelDrag: UseWheelDrag = (drag, takesWheel) => {
  const session = useRef<WheelDragSession>({
    declined: false,
    dragging: false,
    translationY: 0,
    committedDirection: 0,
    idle: undefined,
  });
  const target = useRef<HTMLElement | undefined>(undefined);

  // Read through a ref so the listener is attached once and never has to
  // follow a new `drag` object or predicate.
  const latest = useRef<{ drag: SheetDrag; takesWheel: TakesWheel }>({
    drag,
    takesWheel,
  });

  useEffect(() => {
    latest.current = { drag, takesWheel };
  });

  const handleWheel = useCallback((event: WheelEvent) => {
    const { drag, takesWheel } = latest.current;
    const current = session.current;

    if (owner !== undefined && owner !== current) return;

    const translationY = wheelTranslation(event, drag.availableHeight.value);

    if (owner === undefined) {
      const node = target.current;
      const isOverTarget =
        node !== undefined &&
        event.target instanceof Node &&
        node.contains(event.target);

      if (!isOverTarget) return;

      owner = current;
      current.declined = false;
      current.committedDirection = 0;
    }

    holdGesture(current, drag);

    if (current.declined) return;

    if (!takesWheel(translationY)) {
      current.declined = true;
      endDrag(current, drag);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (current.committedDirection !== 0) {
      const isReversal =
        Math.sign(translationY) === -current.committedDirection;

      if (!isReversal) return;

      current.committedDirection = 0;
    }

    if (!current.dragging) {
      current.dragging = true;
      current.translationY = 0;
      beginSheetDrag(drag);
    }

    current.translationY += translationY;

    if (Math.abs(current.translationY) < COMMIT_TRAVEL) {
      updateSheetDrag(drag, current.translationY);
      return;
    }

    current.dragging = false;
    current.committedDirection = Math.sign(current.translationY);
    stepSheetDrag(drag, current.translationY > 0 ? -1 : 1);
  }, []);

  useEffect(() => {
    const current = session.current;

    // Capture, so the gesture is claimed before the view under the pointer
    // acts on it.
    window.addEventListener('wheel', handleWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      clearTimeout(current.idle);
      if (owner === current) owner = undefined;
    };
  }, [handleWheel]);

  return useCallback((node: unknown) => {
    target.current = node instanceof HTMLElement ? node : undefined;
  }, []);
};
