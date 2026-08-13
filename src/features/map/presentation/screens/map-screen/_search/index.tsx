import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pointerEvents } from '@/core/components/pointer-events';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { useTheme } from '@/core/theme/use-theme';
import { LoadingShimmer } from './_loading-shimmer';
import { SearchField } from './_search-field';
import { SearchResults } from './_search-results';

/** The floating search card at the top of the map. */
export function Search(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      // The strip around the card must not intercept map taps.
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
