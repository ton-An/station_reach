import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TranslucentSurface } from '@/core/components/translucent-surface';
import { useTheme } from '@/core/theme/use-theme';
import { LoadingShimmer } from './_loading-shimmer';
import { SearchField } from './_search-field';
import { SearchResults } from './_search-results';

/** Widest the floating chrome grows on a large screen. */
export const OVERLAY_MAX_WIDTH = 400;

/** The floating search card at the top of the map. */
export function Search() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        alignItems: 'center',
        paddingTop: insets.top + theme.spacing.medium,
        paddingHorizontal: theme.spacing.medium,
        // The strip around the card must not intercept map taps.
        pointerEvents: 'none',
      }}
    >
      <TranslucentSurface
        bordered
        style={{
          width: '100%',
          maxWidth: OVERLAY_MAX_WIDTH,
          pointerEvents: 'auto',
        }}
      >
        <SearchField />
        <SearchResults />
        <LoadingShimmer />
      </TranslucentSurface>
    </View>
  );
}
