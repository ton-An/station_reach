import { useEffect, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { useInAppNotificationStore } from '@/core/notifications/in-app-notification-store';
import { WIDE_LAYOUT_BREAKPOINT } from '@/core/theme/theme';
import { useTheme } from '@/core/theme/use-theme';
import type { Departure } from '../../../domain/models/departure';
import type { Stop } from '../../../domain/models/station';
import { AttributionLegend } from '../../components/attribution-legend';
import { TimeGradientLegend } from '../../components/time-gradient-legend';
import { FOCUS_LATITUDE_OFFSET, FOCUSED_ZOOM } from '../../map/map-config';
import {
  buildRouteFeatures,
  buildStationFeatures,
  EMPTY_ROUTES,
} from '../../map/map-data';
import { MapView } from '../../map/map-view';
import type { MapFocus } from '../../map/map-view.types';
import { useDepartureSelectionStore } from '../../stores/departure-selection-store';
import { useStationDeparturesStore } from '../../stores/station-departures-store';
import { useStationSelectionStore } from '../../stores/station-selection-store';
import { useStationSearchStore } from '../../stores/station-search-store';
import { DeparturesModal, MODAL_HEIGHT_FRACTION } from './_departures-modal';
import { Search } from './_search';

/**
 * The app's only screen.
 *
 * Everything is one map with floating chrome on top: search at the top,
 * departures at the bottom, legends wherever the width allows.
 */
export function MapScreen() {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

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

  const stations = useMemo(
    () => buildStationFeatures(departures, theme.colors.timelineGradient),
    [departures, theme.colors.timelineGradient]
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

  const isWide = width >= WIDE_LAYOUT_BREAKPOINT;
  const modalTopOffset =
    height * MODAL_HEIGHT_FRACTION + theme.spacing.medium * 2;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <MapView
        stations={stations}
        routes={routes}
        focus={focus}
        onStationPress={(stopId) => {
          const stop = findFastestStop(departures, stopId);
          if (stop !== undefined) selectStation(stop, departures);
        }}
        onBackgroundPress={unselectStation}
      />

      {/*
        Chrome floats over the map, so the overlay itself must be transparent
        to input and each panel opts back in. `box-none` is not usable here:
        React Native Web drops it when set through `style`, leaving the overlay
        swallowing every map click.
      */}
      <View style={{ flex: 1, pointerEvents: 'none' }}>
        <Search />

        {isWide && (
          <View
            style={{
              position: 'absolute',
              left: theme.spacing.medium,
              bottom: theme.spacing.medium,
              gap: theme.spacing.xSmall,
              pointerEvents: 'auto',
            }}
          >
            <TimeGradientLegend />
            <AttributionLegend />
          </View>
        )}

        {/* Narrow screens have no room beside the map, so the legends ride
            above the modal instead of beside it. */}
        {!isWide && (
          <View
            style={{
              position: 'absolute',
              left: theme.spacing.medium,
              right: theme.spacing.medium,
              bottom: modalTopOffset,
              gap: theme.spacing.xSmall,
              alignItems: 'flex-start',
              pointerEvents: 'auto',
            }}
          >
            <TimeGradientLegend />
            <AttributionLegend />
          </View>
        )}

        <DeparturesModal />
      </View>
    </View>
  );
}

/**
 * Finds the stop a tapped map feature refers to.
 *
 * The map draws each station once, at its *shortest* travel time, so the tap
 * must resolve to that same stop rather than to whichever trip happens first.
 */
function findFastestStop(
  departures: readonly Departure[],
  stopId: string
): Stop | undefined {
  let fastest: Stop | undefined;

  for (const departure of departures) {
    for (const stop of departure.stops) {
      if (stop.id !== stopId) continue;
      if (
        fastest === undefined ||
        stop.durationMinutes < fastest.durationMinutes
      ) {
        fastest = stop;
      }
    }
  }

  return fastest;
}
