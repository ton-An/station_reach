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
 * scroll spy — but only the rows near the viewport are mounted.
 *
 * That matters because the list is built inside the commit that answers a tap
 * on the map: a well-served stop carries hundreds of departures, each row
 * draws two SVG glyphs, and mounting all of them before anything can paint is
 * what made selecting a station on a device take a visible beat. The web
 * builds the same rows out of DOM nodes and never felt it.
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
