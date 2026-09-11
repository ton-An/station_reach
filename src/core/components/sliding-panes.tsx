import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/core/theme/use-theme';

interface SlidingPanesProps {
  readonly isDetailOpen: boolean;
  readonly primary: React.ReactNode;
  readonly detail: React.ReactNode;
}

/**
 * Two full-width panes side by side, sliding to bring `detail` on screen
 * when `isDetailOpen` is set.
 *
 * Both panes stay mounted the whole time. Toggling only slides between
 * them, so neither loses state while off screen.
 */
export function SlidingPanes({
  isDetailOpen,
  primary,
  detail,
}: SlidingPanesProps): React.JSX.Element {
  const theme = useTheme();

  const slide = useSharedValue(0);
  const [paneWidth, setPaneWidth] = useState(0);

  useEffect(() => {
    slide.value = withTiming(isDetailOpen ? 1 : 0, {
      duration: theme.durations.xShort,
    });
  }, [isDetailOpen, slide, theme.durations.xShort]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -slide.value * paneWidth }],
  }));

  return (
    <View
      style={{ flex: 1, overflow: 'hidden' }}
      onLayout={(event) => setPaneWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          slideStyle,
          { flex: 1, flexDirection: 'row', width: paneWidth * 2 },
        ]}
      >
        <View style={{ width: paneWidth }}>{primary}</View>

        <View style={{ width: paneWidth }}>{detail}</View>
      </Animated.View>
    </View>
  );
}
