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
 * Renders the reachability map for the loaded station: stations coloured by
 * travel time, and the selected departure's route once a stop is tapped.
 *
 * Loading a new station unselects the selected stop and refocuses the map on
 * it. Tapping a station looks up its stop in {@link buildStopIndex} and
 * selects it; tapping the background unselects. An open departure belongs to
 * the stop it was opened from, so it closes whenever that selection moves.
 */
export function ReachabilityMap(): React.JSX.Element {
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

  const stopIndex = useMemo(() => buildStopIndex(departures), [departures]);

  const stations = useMemo(
    () => buildStationFeatures(stopIndex, theme.colors.timelineGradient),
    [stopIndex, theme.colors.timelineGradient]
  );

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

  const loadedStationId =
    departuresState.status === 'loaded'
      ? departuresState.station.id
      : undefined;

  const selectedStopId =
    stationSelection.status === 'selected'
      ? stationSelection.selectedStop.id
      : undefined;

  useEffect(() => {
    if (loadedStationId === undefined) return;

    unselectStation();
  }, [loadedStationId, unselectStation]);

  useEffect(() => {
    deselectDeparture();
  }, [selectedStopId, deselectDeparture]);

  const handleStationPress = useCallback(
    (stopId: string) => {
      const entry = stopIndex.get(stopId);
      if (entry === undefined) return;

      selectStation(entry.stop, entry.departures);
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
