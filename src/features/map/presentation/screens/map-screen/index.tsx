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
 * The app's only screen.
 *
 * Everything is one map with floating chrome on top: search at the top,
 * departures at the bottom, legends wherever the width allows. This file is
 * that arrangement and nothing else — each panel subscribes to the state it
 * renders, so nothing has to be handed down through here.
 */
export function MapScreen() {
  const theme = useTheme();
  const isWide = useIsWideLayout();

  useFailureNotifier();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ReachabilityMap />

      {/* Chrome floats over the map, so the overlay itself must be
          transparent to input while each panel inside it still takes its. */}
      <View style={[pointerEvents.passThrough, { flex: 1 }]}>
        <Search />

        <DeparturesModal />
      </View>

      {/* Wide screens have room for the legends beside the map; narrow ones
          carry them above the sheet, inside the modal. */}
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
