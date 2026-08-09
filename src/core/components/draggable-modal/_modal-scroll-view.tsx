import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  beginSheetDrag,
  DRAG_ACTIVATION_SLOP,
  endSheetDrag,
  LARGE_HEIGHT,
  updateSheetDrag,
  useSheetDrag,
} from './_sheet-drag';

interface ModalScrollViewProps {
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly children: React.ReactNode;
}

/**
 * The scrolling body of a {@link DraggableModal}.
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
 */
export function ModalScrollView({
  contentContainerStyle,
  children,
}: ModalScrollViewProps) {
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

  return (
    <GestureDetector gesture={sheetDrag}>
      <GestureDetector gesture={scroll}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={contentContainerStyle}
        >
          {children}
        </Animated.ScrollView>
      </GestureDetector>
    </GestureDetector>
  );
}
