import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';

interface SlidingPanesProps {
  /** Which pane is showing. The detail slides in from the right. */
  readonly isDetailOpen: boolean;
  readonly primary: React.ReactNode;
  readonly detail: React.ReactNode;
}

/**
 * Two full-width panes on a rail, one of which is on screen.
 *
 * A drill-down without a navigator: the panes are siblings inside whatever
 * contains them — a sheet, a card — so the container keeps its own chrome and
 * its own size while the content slides underneath it.
 *
 * The rail is offset by a measured pixel width rather than by `-100%`, because
 * the native animation driver silently ignores a percentage `translateX`: a
 * pager written that way animates on the web and sits still on a device.
 */
export function SlidingPanes({
  isDetailOpen,
  primary,
  detail,
}: SlidingPanesProps) {
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
