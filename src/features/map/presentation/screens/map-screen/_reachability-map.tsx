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
 * Renders the MapView with station markers coloured by travel time.
 *
 * Tapping a marker opens the departures modal for that stop. Tapping the
 * background closes the modal. When new departures load, the map focuses on
 * the origin and clears any active selection.
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

  useEffect(() => {
    if (loadedStationId === undefined) return;

    unselectStation();
    deselectDeparture();
  }, [loadedStationId, unselectStation, deselectDeparture]);

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
