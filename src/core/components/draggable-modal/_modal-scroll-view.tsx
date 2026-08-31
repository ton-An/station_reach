import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { View, type StyleProp, type ViewStyle } from 'react-native';

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
  const { sheetDrag, scroll, onScroll, wheelTarget } = useModalBodyGestures();

  return (
    <View ref={wheelTarget} style={{ flex: 1 }}>
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
    </View>
  );
}
