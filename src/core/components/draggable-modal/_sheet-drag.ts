import { createContext, useContext } from 'react';
import {
  cancelAnimation,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/**
 * Fractions of the sheet's available height a drag can settle at.
 * {@link MEDIUM_HEIGHT} is both the sheet's opening height and a detent a
 * later drag can return to.
 */
export const SMALL_HEIGHT = 0.3;
export const MEDIUM_HEIGHT = 0.6;
export const LARGE_HEIGHT = 1;

const DETENTS = [SMALL_HEIGHT, MEDIUM_HEIGHT, LARGE_HEIGHT] as const;

/**
 * Seconds of release velocity {@link settleSheetDrag} adds to the sheet's
 * position before it picks a detent, so a flick carries past the detent it
 * was released next to.
 */
const VELOCITY_PROJECTION_SECONDS = 0.25;

/**
 * Under-damped on purpose: the sheet overshoots its detent by a hair, which
 * is what makes a release read as thrown rather than driven.
 */
const SNAP_SPRING = {
  damping: 20,
  stiffness: 190,
  mass: 0.85,
} as const;

/**
 * Vertical travel, in pixels, a touch must move before a pan gesture starts
 * dragging the sheet. Filters out taps and near-stationary touches.
 */
export const DRAG_ACTIVATION_SLOP = 2;

/**
 * Sheet-drag state shared, through {@link SheetDragProvider}, between the
 * sheet shell in {@link DraggableModal} and its scrollable body. Every
 * `SharedValue` field is written by the worklets in this file, on the UI
 * thread.
 */
export interface SheetDrag {
  /** Current sheet height, as a fraction of `availableHeight`. */
  readonly fraction: SharedValue<number>;
  readonly availableHeight: SharedValue<number>;
  readonly dragStartFraction: SharedValue<number>;
  /**
   * Called on the JS thread with the detent a release settles at, and only
   * when that detent differs from the one the drag started at.
   */
  readonly onSettle: (fraction: number) => void;
}

const SheetDragContext = createContext<SheetDrag | undefined>(undefined);

export const SheetDragProvider = SheetDragContext.Provider;

/**
 * Reads the {@link SheetDrag} state shared by the nearest
 * {@link DraggableModal}.
 *
 * @throws Error when called outside a {@link DraggableModal}.
 */
export function useSheetDrag(): SheetDrag {
  const drag = useContext(SheetDragContext);

  if (drag === undefined) {
    throw new Error('useSheetDrag must be used inside a DraggableModal.');
  }

  return drag;
}

/**
 * Starts a sheet drag: stops any snap still running and records the sheet's
 * current height fraction as the point the drag moves from. Runs on the UI
 * thread inside a gesture's `onStart`.
 */
export function beginSheetDrag(drag: SheetDrag): void {
  'worklet';
  cancelAnimation(drag.fraction);
  drag.dragStartFraction.value = drag.fraction.value;
}

/**
 * Moves the sheet with an in-progress drag: adds the drag's vertical
 * translation, as a fraction of `availableHeight`, to the fraction
 * {@link beginSheetDrag} recorded, clamped between {@link SMALL_HEIGHT} and
 * {@link LARGE_HEIGHT}. Does nothing until the sheet has been laid out.
 * Runs on the UI thread inside a gesture's `onUpdate`.
 */
export function updateSheetDrag(drag: SheetDrag, translationY: number): void {
  'worklet';
  if (drag.availableHeight.value === 0) return;

  const next =
    drag.dragStartFraction.value - translationY / drag.availableHeight.value;

  drag.fraction.value = Math.min(Math.max(next, SMALL_HEIGHT), LARGE_HEIGHT);
}

// Declared above its caller: a worklet captures the worklets it calls when
// the module is evaluated, so a later declaration is still in its TDZ.
function nearestDetent(fraction: number): number {
  'worklet';
  let nearest: number = SMALL_HEIGHT;

  for (const detent of DETENTS) {
    if (Math.abs(detent - fraction) < Math.abs(nearest - fraction)) {
      nearest = detent;
    }
  }

  return nearest;
}

/**
 * Ends a sheet drag, springing the sheet to the detent nearest to where its
 * release velocity was heading. Runs on the UI thread inside a gesture's
 * `onEnd`.
 *
 * @param velocityY - Release velocity in pixels per second, positive
 * downwards, as the gesture reports it.
 */
export function settleSheetDrag(drag: SheetDrag, velocityY: number): void {
  'worklet';
  const height = drag.availableHeight.value;
  if (height === 0) return;

  const projected =
    drag.fraction.value - (velocityY / height) * VELOCITY_PROJECTION_SECONDS;

  const target = nearestDetent(projected);

  drag.fraction.value = withSpring(target, SNAP_SPRING);

  if (target !== drag.dragStartFraction.value) {
    scheduleOnRN(drag.onSettle, target);
  }
}
