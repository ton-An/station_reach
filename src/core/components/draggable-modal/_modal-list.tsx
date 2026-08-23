import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import type { ListRenderItem, StyleProp, ViewStyle } from 'react-native';

import { SHOWS_SCROLL_INDICATOR } from '@/core/components/scroll-indicator';
import { SCROLL_EVENT_THROTTLE, useModalBodyGestures } from './_body-gestures';

interface ModalListProps<T> {
  readonly data: readonly T[];
  readonly keyExtractor: (item: T, index: number) => string;
  readonly renderItem: ListRenderItem<T>;
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Scrollable list for a {@link DraggableModal}'s body. Wraps
 * `Animated.FlatList` and, once its content is scrolled to the top, hands an
 * overscroll back to the sheet as a drag — see {@link useModalBodyGestures}.
 */
export function ModalList<T>({
  data,
  keyExtractor,
  renderItem,
  contentContainerStyle,
}: ModalListProps<T>): React.JSX.Element {
  const { sheetDrag, scroll, onScroll } = useModalBodyGestures();

  return (
    <GestureDetector gesture={sheetDrag}>
      <GestureDetector gesture={scroll}>
        <Animated.FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onScroll={onScroll}
          scrollEventThrottle={SCROLL_EVENT_THROTTLE}
          showsVerticalScrollIndicator={SHOWS_SCROLL_INDICATOR}
          contentContainerStyle={contentContainerStyle}
        />
      </GestureDetector>
    </GestureDetector>
  );
}
