import { useCallback, useEffect, useMemo } from 'react';

import { useTheme } from '@/core/theme/use-theme';
import { FOCUS_LATITUDE_OFFSET, FOCUSED_ZOOM } from '../../map/map-config';
import {
  buildRouteFeatures,
  buildStationFeatures,
  EMPTY_ROUTES,
} from '../../map/map-features';
import { MapView } from '../../map/map-view';
import type { MapFocus } from '../../map/map-view.types';
import { buildStopIndex } from '../../map/stop-index';
import {
  useDepartureSelectionStore,
  useStationDeparturesStore,
  useStationSelectionStore,
} from '../../stores/use-map-stores';

/**
 * The map, and everything drawn on it.
 *
 * Deliberately its own component rather than part of the screen: it subscribes
 * to the two stores the map actually depends on, so the chrome above it — a
 * keystroke in the search field, a notification arriving — never re-renders the
 * map subtree at all. {@link MapView} memoises, but reaching that memo still
 * costs a pass over every derivation below.
 */
export function ReachabilityMap() {
  const theme = useTheme();

  const departuresState = useStationDeparturesStore((store) => store.state);
  const stationSelection = useStationSelectionStore((store) => store.state);
  const selectStation = useStationSelectionStore((store) => store.select);
  const unselectStation = useStationSelectionStore((store) => store.unselect);
  const deselectDeparture = useDepartureSelectionStore(
    (store) => store.deselect
  );

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

  // A new reachability set invalidates whatever was selected against the old
  // one: the stop may not exist on this map, and the itinerary certainly does
  // not belong to it.
  const loadedStationId =
    departuresState.status === 'loaded'
      ? departuresState.station.id
      : undefined;

  useEffect(() => {
    if (loadedStationId === undefined) return;

    unselectStation();
    deselectDeparture();
  }, [loadedStationId, unselectStation, deselectDeparture]);

  // Stable, because the map memoises on its props: an unrelated re-render would
  // otherwise re-serialise every station and route across the bridge before
  // anything could paint.
  const handleStationPress = useCallback(
    (stopId: string) => {
      const entry = stopIndex.get(stopId);
      if (entry !== undefined) selectStation(entry.stop, entry.departures);
    },
    [stopIndex, selectStation]
  );

  return (
    <MapView
      stations={stations}
      routes={routes}
      focus={focus}
      onStationPress={handleStationPress}
      onBackgroundPress={unselectStation}
    />
  );
}
