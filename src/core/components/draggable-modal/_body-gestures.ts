import {
  Gesture,
  type NativeGesture,
  type PanGesture,
} from 'react-native-gesture-handler';
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {
  beginSheetDrag,
  DRAG_ACTIVATION_SLOP,
  endSheetDrag,
  LARGE_HEIGHT,
  updateSheetDrag,
  useSheetDrag,
} from './_sheet-drag';

/** How often the scrollable reports its offset, in milliseconds. */
export const SCROLL_EVENT_THROTTLE = 16;

/** What a scrolling sheet body has to wire up to behave inside the sheet. */
export interface ModalBodyGestures {
  /** The outer detector: it may take the touch away from the list. */
  readonly sheetDrag: PanGesture;
  /** The inner detector: the scrollable's own recogniser. */
  readonly scroll: NativeGesture;
  /** Attach to the scrollable, so the drag can see where the list stands. */
  readonly onScroll: ReturnType<typeof useAnimatedScrollHandler>;
}

/**
 * Wires a scrollable into the sheet it lives in.
 *
 * Every finger that lands on the body is claimed by one of two gestures, and
 * the choice is made on the UI thread on the first pixel of movement:
 *
 * - the sheet is not fully drawn up → the sheet moves, whichever way the
 *   finger goes, so a list can be pulled open from anywhere on it;
 * - the sheet is up and the list sits at its top and the finger goes down →
 *   the sheet collapses, which is the gesture that would otherwise dead-end
 *   in a list that cannot scroll any further;
 * - anything else → the list scrolls.
 *
 * The scroll view is held back until that decision is made, so a scroll never
 * starts underneath a drag that is about to take it over.
 *
 * Returns:
 * - the two gestures to nest around the scrollable, and its scroll handler
 */
export function useModalBodyGestures(): ModalBodyGestures {
  const drag = useSheetDrag();

  /** The body's own scroll offset — the other half of the decision. */
  const scrollOffset = useSharedValue(0);
  const touchStartY = useSharedValue(0);

  const scroll = Gesture.Native();

  const sheetDrag = Gesture.Pan()
    .manualActivation(true)
    .blocksExternalGesture(scroll)
    .onTouchesDown((event) => {
      const touch = event.changedTouches[0];
      if (touch !== undefined) touchStartY.value = touch.absoluteY;
    })
    .onTouchesMove((event, manager) => {
      const touch = event.changedTouches[0];
      if (touch === undefined) return;

      const travel = touch.absoluteY - touchStartY.value;
      if (Math.abs(travel) < DRAG_ACTIVATION_SLOP) return;

      const pullingDown = travel > 0;
      const atTop = scrollOffset.value <= 0;

      if (drag.fraction.value < LARGE_HEIGHT || (pullingDown && atTop)) {
        manager.activate();
      } else {
        manager.fail();
      }
    })
    .onStart(() => beginSheetDrag(drag))
    .onUpdate((event) => updateSheetDrag(drag, event.translationY))
    .onEnd((event) => endSheetDrag(drag, event.translationY));

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
  });

  return { sheetDrag, scroll, onScroll };
}
