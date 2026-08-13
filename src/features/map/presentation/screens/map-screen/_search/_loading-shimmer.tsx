import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';
import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../../stores/use-map-stores';

/** How much of the bar the moving highlight covers. */
const HIGHLIGHT_FRACTION = 0.4;

/** How thick the bar under the search field is. */
const BAR_HEIGHT = 8;

/** How far the highlight fades against the track behind it. */
const HIGHLIGHT_OPACITY = 0.5;

/**
 * A shimmering bar under the search field while anything is loading.
 *
 * Covers both the quick search and the slow reachability fetch, so the user
 * always knows the app is working.
 */
export function LoadingShimmer(): React.JSX.Element | null {
  const theme = useTheme();

  const isSearching = useStationSearchStore(
    (store) => store.state.status === 'loading'
  );
  const isLoadingDepartures = useStationDeparturesStore(
    (store) => store.state.status === 'loading'
  );

  const isLoading = isSearching || isLoadingDepartures;

  // Measured, because `translateX` must be a number — a percentage string is
  // silently ignored by the native animation driver.
  const [width, setWidth] = useState(0);
  const [sweep] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!isLoading || width === 0) return;

    const animation = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: theme.durations.xHuge,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      sweep.setValue(0);
    };
  }, [isLoading, width, sweep, theme.durations.xHuge]);

  if (!isLoading) return null;

  const highlightWidth = width * HIGHLIGHT_FRACTION;

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
        style={{
          width: highlightWidth,
          height: '100%',
          backgroundColor: theme.colors.primary,
          opacity: HIGHLIGHT_OPACITY,
          transform: [
            {
              translateX: sweep.interpolate({
                inputRange: [0, 1],
                outputRange: [-highlightWidth, width],
              }),
            },
          ],
        }}
      />
    </View>
  );
}
