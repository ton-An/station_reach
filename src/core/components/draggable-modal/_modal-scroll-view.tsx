import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import { SCROLL_EVENT_THROTTLE, useModalBodyGestures } from './_body-gestures';

interface ModalScrollViewProps {
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly children: React.ReactNode;
}

export function ModalScrollView({
  contentContainerStyle,
  children,
}: ModalScrollViewProps): React.JSX.Element {
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
