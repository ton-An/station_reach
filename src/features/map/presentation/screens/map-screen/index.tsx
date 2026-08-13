import { View } from 'react-native';

import { pointerEvents } from '@/core/components/pointer-events';
import { useIsWideLayout } from '@/core/theme/use-is-wide-layout';
import { useTheme } from '@/core/theme/use-theme';
import { MapLegends } from '../../components/map-legends';
import { DeparturesModal } from './_departures-modal';
import { ReachabilityMap } from './_reachability-map';
import { Search } from './_search';
import { useFailureNotifier } from './_use-failure-notifier';

/**
 * The app's only screen: an interactive reachability map.
 *
 * Sub-components:
 * - ReachabilityMap: the map with station markers and route polylines
 * - Search: station search input and results overlay
 * - DeparturesModal: departures list and itinerary modal
 * - MapLegends: travel-time colour legend (wide layout only)
 */
export function MapScreen(): React.JSX.Element {
  const theme = useTheme();
  const isWide = useIsWideLayout();

  useFailureNotifier();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ReachabilityMap />

      <View style={[pointerEvents.passThrough, { flex: 1 }]}>
        <Search />

        <DeparturesModal />
      </View>

      {isWide && (
        <View
          style={[
            pointerEvents.passThrough,
            {
              position: 'absolute',
              left: theme.spacing.medium,
              bottom: theme.spacing.medium,
              width: theme.layout.legendClusterWidth,
            },
          ]}
        >
          <MapLegends />
        </View>
      )}
    </View>
  );
}
