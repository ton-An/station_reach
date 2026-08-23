import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import { SHOWS_SCROLL_INDICATOR } from '@/core/components/scroll-indicator';
import { SCROLL_EVENT_THROTTLE, useModalBodyGestures } from './_body-gestures';

interface ModalScrollViewProps {
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly children: React.ReactNode;
}

/**
 * Scrollable body for a {@link DraggableModal} that isn't a list. Hands
 * overscroll back to the sheet the same way {@link ModalList} does.
 */
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
          showsVerticalScrollIndicator={SHOWS_SCROLL_INDICATOR}
          contentContainerStyle={contentContainerStyle}
        >
          {children}
        </Animated.ScrollView>
      </GestureDetector>
    </GestureDetector>
  );
}
