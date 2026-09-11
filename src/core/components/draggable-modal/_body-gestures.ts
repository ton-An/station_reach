import {
  Gesture,
  type NativeGesture,
  type PanGesture,
} from 'react-native-gesture-handler';
import {
  type SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {
  beginSheetDrag,
  DRAG_ACTIVATION_SLOP,
  LARGE_HEIGHT,
  nearestDetent,
  settleSheetDrag,
  updateSheetDrag,
  useSheetDrag,
} from './_sheet-drag';
import { useWheelDrag } from './_wheel-drag';
import type { WheelTarget } from './_wheel-drag.types';

export const SCROLL_EVENT_THROTTLE = 16;

export interface ModalBodyGestures {
  readonly sheetDrag: PanGesture;
  readonly scroll: NativeGesture;
  readonly onScroll: ReturnType<typeof useAnimatedScrollHandler>;
  /** Belongs on the view wrapping the scrollable, not on the scrollable. */
  readonly wheelTarget: WheelTarget;
}

// Declared above its caller: a worklet captures the worklets it calls when
// the module is evaluated, so a later declaration is still in its TDZ.
function sheetTakesMove(options: {
  readonly fraction: number;
  readonly scrollOffset: SharedValue<number>;
  readonly translationY: number;
}): boolean {
  'worklet';
  const { fraction, scrollOffset, translationY } = options;

  const pullingDown = translationY > 0;
  const atTop = scrollOffset.value <= 0;

  return fraction < LARGE_HEIGHT || (pullingDown && atTop);
}

/**
 * Builds the gestures a {@link DraggableModal} body needs to both scroll its
 * own content and drag the sheet.
 *
 * Once a touch travels past {@link DRAG_ACTIVATION_SLOP}, it drags the sheet
 * when the sheet is below {@link LARGE_HEIGHT}, or when it is at
 * {@link LARGE_HEIGHT} and the touch is pulling down while the content is
 * already scrolled to its top. Every other touch scrolls the content
 * instead. A wheel is handed out by the same rule — see {@link useWheelDrag}.
 * Used by {@link ModalList} and {@link ModalScrollView}.
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

      const takesTouch = sheetTakesMove({
        fraction: drag.fraction.value,
        scrollOffset,
        translationY: travel,
      });

      if (takesTouch) {
        manager.activate();
      } else {
        manager.fail();
      }
    })
    .onStart(() => beginSheetDrag(drag))
    .onUpdate((event) => updateSheetDrag(drag, event.translationY))
    .onEnd((event) => settleSheetDrag(drag, event.velocityY));

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
  });

  // Against the detent the sheet is springing to, not where the spring has
  // reached: a sheet already committed to full height owes what follows to
  // its content, and waiting out the spring would swallow it.
  const wheelTarget = useWheelDrag(drag, (translationY) =>
    sheetTakesMove({
      fraction: nearestDetent(drag.fraction.value),
      scrollOffset,
      translationY,
    })
  );

  return { sheetDrag, scroll, onScroll, wheelTarget };
}
