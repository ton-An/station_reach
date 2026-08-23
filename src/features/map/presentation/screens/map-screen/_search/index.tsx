import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pointerEvents } from '@/core/components/pointer-events';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { useTheme } from '@/core/theme/use-theme';
import { SearchLoadingShimmer } from './_search-loading-shimmer';
import { SearchField } from './_search-field';
import { SearchResults } from './_search-results';

/**
 * The floating search surface: input field, matching stations and a loading
 * indicator, stacked inside one translucent surface.
 *
 * Sub-components:
 * - {@link SearchField}: debounced station name input
 * - {@link SearchResults}: matching stations, picks one to load
 * - {@link SearchLoadingShimmer}: loading indicator for search and departures
 */
export function Search(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        pointerEvents.passThrough,
        {
          // Above the departures modal, which follows it in the screen and
          // would otherwise cover the results while sliding out from under
          // them.
          zIndex: 1,
          alignItems: 'center',
          paddingTop: insets.top + theme.spacing.medium,
          paddingHorizontal: theme.spacing.medium,
        },
      ]}
    >
      <TranslucentSurface
        style={{ width: '100%', maxWidth: theme.layout.overlayMaxWidth }}
      >
        <SearchField />
        <SearchResults />
        <SearchLoadingShimmer />
      </TranslucentSurface>
    </View>
  );
}
