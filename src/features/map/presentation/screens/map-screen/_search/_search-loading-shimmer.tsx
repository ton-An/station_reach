import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/core/theme/use-theme';
import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../../stores/use-map-stores';

const HIGHLIGHT_FRACTION = 0.4;

const BAR_HEIGHT = 8;

const HIGHLIGHT_OPACITY = 0.5;

/**
 * Loading indicator for {@link StationSearchStore} and
 * {@link StationDeparturesStore}: a translucent bar with a highlight that
 * sweeps left to right on loop. Hidden once neither is loading.
 */
export function SearchLoadingShimmer(): React.JSX.Element | null {
  const theme = useTheme();

  const isSearching = useStationSearchStore(
    (store) => store.state.status === 'loading'
  );
  const isLoadingDepartures = useStationDeparturesStore(
    (store) => store.state.status === 'loading'
  );

  const isLoading = isSearching || isLoadingDepartures;

  const [width, setWidth] = useState(0);
  const sweep = useSharedValue(0);

  const highlightWidth = width * HIGHLIGHT_FRACTION;

  useEffect(() => {
    if (!isLoading || width === 0) return;

    sweep.value = 0;
    sweep.value = withRepeat(
      withTiming(1, {
        duration: theme.durations.xHuge,
        easing: Easing.linear,
      }),
      -1
    );

    return () => cancelAnimation(sweep);
  }, [isLoading, width, sweep, theme.durations.xHuge]);

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -highlightWidth + sweep.value * (width + highlightWidth) },
    ],
  }));

  if (!isLoading) return null;

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{
        height: BAR_HEIGHT,
        overflow: 'hidden',
        backgroundColor: theme.colors.primaryTranslucent,
      }}
    >
      <Animated.View
        style={[
          highlightStyle,
          {
            width: highlightWidth,
            height: '100%',
            backgroundColor: theme.colors.primary,
            opacity: HIGHLIGHT_OPACITY,
          },
        ]}
      />
    </View>
  );
}
