import { useCallback, useEffect, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { pointerEvents } from '@/core/components/pointer-events';
import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';
import { WIDE_LAYOUT_BREAKPOINT } from '@/core/theme/theme';
import { useTheme } from '@/core/theme/use-theme';
import { FOCUS_LATITUDE_OFFSET, FOCUSED_ZOOM } from '../../map/map-config';
import {
  buildRouteFeatures,
  buildStationFeatures,
  buildStopIndex,
  EMPTY_ROUTES,
} from '../../map/map-data';
import { MapView } from '../../map/map-view';
import type { MapFocus } from '../../map/map-view.types';
import {
  useDepartureSelectionStore,
  useStationDeparturesStore,
  useStationSearchStore,
  useStationSelectionStore,
} from '../../stores/use-map-stores';
import { DeparturesModal } from './_departures-modal';
import { MapLegends } from './_map-legends';
import { Search } from './_search';

/** How wide the bottom-left legend cluster is on a large screen. */
const LEGEND_CLUSTER_WIDTH = 320;

/**
 * The app's only screen.
 *
 * Everything is one map with floating chrome on top: search at the top,
 * departures at the bottom, legends wherever the width allows.
 */
export function MapScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const departuresState = useStationDeparturesStore((store) => store.state);
  const searchState = useStationSearchStore((store) => store.state);
  const stationSelection = useStationSelectionStore((store) => store.state);
  const selectStation = useStationSelectionStore((store) => store.select);
  const unselectStation = useStationSelectionStore((store) => store.unselect);
  const deselectDeparture = useDepartureSelectionStore(
    (store) => store.deselect
  );
  const sendFailure = useInAppNotificationStore((store) => store.sendFailure);

  const departures = useMemo(
    () =>
      departuresState.status === 'loaded' ? departuresState.departures : [],
    [departuresState]
  );

  // Resolved once per reachability set, so a tap is a lookup and not a scan.
  const stopIndex = useMemo(() => buildStopIndex(departures), [departures]);

  const stations = useMemo(
    () => buildStationFeatures(stopIndex, theme.colors.timelineGradient),
    [stopIndex, theme.colors.timelineGradient]
  );

  // Routes are drawn only for the stop the user picked, not for everything.
  const routes = useMemo(
    () =>
      stationSelection.status === 'selected'
        ? buildRouteFeatures(
            stationSelection.departures,
            theme.colors.timelineGradient
          )
        : EMPTY_ROUTES,
    [stationSelection, theme.colors.timelineGradient]
  );

  // A fresh object identity re-issues the camera move, so picking the same
  // station twice still recentres.
  const focus = useMemo<MapFocus | undefined>(
    () =>
      departuresState.status === 'loaded'
        ? {
            center: [
              departuresState.station.longitude,
              departuresState.station.latitude + FOCUS_LATITUDE_OFFSET,
            ],
            zoom: FOCUSED_ZOOM,
          }
        : undefined,
    [departuresState]
  );

  // A new reachability set invalidates whatever was selected against the old one.
  const loadedStationId =
    departuresState.status === 'loaded'
      ? departuresState.station.id
      : undefined;

  useEffect(() => {
    if (loadedStationId === undefined) return;

    unselectStation();
    deselectDeparture();
  }, [loadedStationId, unselectStation, deselectDeparture]);

  const failure =
    departuresState.status === 'failure'
      ? departuresState.failure
      : searchState.status === 'failure'
        ? searchState.failure
        : undefined;

  useEffect(() => {
    if (failure !== undefined) sendFailure(failure);
  }, [failure, sendFailure]);

  // Stable, because the map memoises on its props: an unrelated re-render —
  // a keystroke in the search field — would otherwise re-serialise every
  // station and route across the bridge before anything could paint.
  const handleStationPress = useCallback(
    (stopId: string) => {
      const entry = stopIndex.get(stopId);
      if (entry !== undefined) selectStation(entry.stop, entry.departures);
    },
    [stopIndex, selectStation]
  );

  const isWide = width >= WIDE_LAYOUT_BREAKPOINT;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <MapView
        stations={stations}
        routes={routes}
        focus={focus}
        onStationPress={handleStationPress}
        onBackgroundPress={unselectStation}
      />

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
              width: LEGEND_CLUSTER_WIDTH,
            },
          ]}
        >
          <MapLegends />
        </View>
      )}
    </View>
  );
}
