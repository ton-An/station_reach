import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import { SCROLL_EVENT_THROTTLE, useModalBodyGestures } from './_body-gestures';

interface ModalScrollViewProps {
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly children: React.ReactNode;
}

/**
 * The scrolling body of a {@link DraggableModal}.
 *
 * Mounts everything it is given, so it belongs to bodies of a known, small
 * size. A list whose length comes from the API — the departures at a stop —
 * wants {@link ModalList} instead.
 *
 * See {@link useModalBodyGestures} for how a finger is shared between the
 * sheet and the list inside it.
 */
export function ModalScrollView({
  contentContainerStyle,
  children,
}: ModalScrollViewProps) {
  const { sheetDrag, scroll, onScroll } = useModalBodyGestures();

  return (
    <GestureDetector gesture={sheetDrag}>
      <GestureDetector gesture={scroll}>
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={SCROLL_EVENT_THROTTLE}
          contentContainerStyle={contentContainerStyle}
        >
          {children}
        </Animated.ScrollView>
      </GestureDetector>
    </GestureDetector>
  );
}
