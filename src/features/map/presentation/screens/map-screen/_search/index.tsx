import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pointerEvents } from '@/core/components/pointer-events';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { useTheme } from '@/core/theme/use-theme';
import { LoadingShimmer } from './_loading-shimmer';
import { SearchField } from './_search-field';
import { SearchResults } from './_search-results';

/**
 * The station search interface.
 *
 * Sub-components:
 * - SearchField: station name input with debounced search
 * - SearchResults: scrollable list of matching stations
 * - LoadingShimmer: progress indicator during search or departures load
 */
export function Search(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        pointerEvents.passThrough,
        {
          alignItems: 'center',
          paddingTop: insets.top + theme.spacing.medium,
          paddingHorizontal: theme.spacing.medium,
        },
      ]}
    >
      <TranslucentSurface
        bordered
        style={{ width: '100%', maxWidth: theme.layout.overlayMaxWidth }}
      >
        <SearchField />
        <SearchResults />
        <LoadingShimmer />
      </TranslucentSurface>
    </View>
  );
}
