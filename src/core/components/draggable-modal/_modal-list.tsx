import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import type { ListRenderItem, StyleProp, ViewStyle } from 'react-native';

import { SCROLL_EVENT_THROTTLE, useModalBodyGestures } from './_body-gestures';

interface ModalListProps<T> {
  readonly data: readonly T[];
  readonly keyExtractor: (item: T, index: number) => string;
  readonly renderItem: ListRenderItem<T>;
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * The scrolling body of a {@link DraggableModal}, virtualised.
 *
 * Identical to {@link ModalScrollView} to a finger — same two gestures, same
 * scroll spy — but only the rows near the viewport are mounted, so a list of
 * unbounded length does not have to be built before the sheet can paint.
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
          contentContainerStyle={contentContainerStyle}
        />
      </GestureDetector>
    </GestureDetector>
  );
}
