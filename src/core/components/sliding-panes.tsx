import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';

interface SlidingPanesProps {
  /** Which pane is on screen. The detail slides in from the right. */
  readonly isDetailOpen: boolean;
  readonly primary: React.ReactNode;
  readonly detail: React.ReactNode;
}

/**
 * Two full-width panes on a rail, one of which is on screen.
 *
 * The rail is offset by a measured pixel width. The native animation driver
 * ignores a percentage `translateX`.
 */
export function SlidingPanes({
  isDetailOpen,
  primary,
  detail,
}: SlidingPanesProps): React.JSX.Element {
  const theme = useTheme();

  const [slide] = useState(() => new Animated.Value(0));
  const [paneWidth, setPaneWidth] = useState(0);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: isDetailOpen ? 1 : 0,
      duration: theme.durations.xShort,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [isDetailOpen, slide, theme.durations.xShort]);

  return (
    <View
      style={{ flex: 1, overflow: 'hidden' }}
      onLayout={(event) => setPaneWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        style={{
          flex: 1,
          flexDirection: 'row',
          width: paneWidth * 2,
          transform: [
            {
              translateX: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -paneWidth],
              }),
            },
          ],
        }}
      >
        <View style={{ width: paneWidth }}>{primary}</View>

        <View style={{ width: paneWidth }}>{detail}</View>
      </Animated.View>
    </View>
  );
}
