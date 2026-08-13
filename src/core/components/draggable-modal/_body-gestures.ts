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

export interface ModalBodyGestures {
  readonly sheetDrag: PanGesture;
  readonly scroll: NativeGesture;
  readonly onScroll: ReturnType<typeof useAnimatedScrollHandler>;
}

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
