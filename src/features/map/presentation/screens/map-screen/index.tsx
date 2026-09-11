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
 * The app's one screen: the reachability map, the floating search bar and
 * departures modal above it, and — on wide layouts — the legend cluster
 * anchored bottom-left. {@link DeparturesModal} renders the same legend
 * inline instead when the layout is narrow.
 *
 * {@link useFailureNotifier} turns store failures into notifications.
 *
 * Sub-components:
 * - {@link ReachabilityMap}: the map, coloured by travel time
 * - {@link Search}: station search field and results
 * - {@link DeparturesModal}: departures list and selected itinerary
 */
export function MapScreen(): React.JSX.Element {
  const theme = useTheme();
  const isWide = useIsWideLayout();

  useFailureNotifier();

  return (
    <View
      style={{
        flex: 1,
        // The screen is the only clip. Panels below the search bar overhang
        // their own boxes while they slide, and are meant to be seen doing
        // it; nothing should leave the screen.
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
      }}
    >
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
