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

export const SCROLL_EVENT_THROTTLE = 16;

/** What a scrolling sheet body has to wire up to behave inside the sheet. */
export interface ModalBodyGestures {
  /** The outer detector. It may take the touch away from the list. */
  readonly sheetDrag: PanGesture;
  /**
   * The inner detector, held back by `blocksExternalGesture` until the outer
   * one activates or fails.
   */
  readonly scroll: NativeGesture;
  /** Attach to the scrollable, so the drag can see where the list stands. */
  readonly onScroll: ReturnType<typeof useAnimatedScrollHandler>;
}

/**
 * Wires a scrollable into the sheet it lives in.
 *
 * The pan uses `manualActivation`, and decides once the finger has moved
 * further than {@link DRAG_ACTIVATION_SLOP}:
 * - the sheet is below {@link LARGE_HEIGHT}, so `activate()` and drag it
 * - the list is at its top and the finger is going down, so `activate()`
 * - anything else, so `fail()` and let the list scroll
 *
 * @returns The two gestures to nest around the scrollable, and its scroll
 * handler.
 */
export function useModalBodyGestures(): ModalBodyGestures {
  const drag = useSheetDrag();

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
