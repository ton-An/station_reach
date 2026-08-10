import {
  Camera,
  MapView as MapLibreMapView,
  type CameraRef,
  type MapViewRef,
  type OnPressEvent,
} from '@maplibre/maplibre-react-native';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { PixelRatio, Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useTheme } from '@/core/theme/use-theme';
import { RoutesSource } from './_routes-source';
import { StationsSource } from './_stations-source';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  LAYER_IDS,
  MIN_ZOOM,
  STATION_HIT_RADIUS,
} from './map-config';
import {
  nearestStopId,
  type StationCandidate,
  type StationFeatureProperties,
} from './map-data';
import type { MapViewProps } from './map-view.types';

/*
  The feature query takes a rect in the map view's own coordinate system, which
  the two bindings disagree about. iOS builds a `CGRect` as
  `(left, bottom, right - left, top - bottom)` and so needs `top` to be the
  larger y; Android sets a `RectF` straight from the same array and needs it to
  be the smaller one. Android also measures in raw pixels where iOS measures in
  view points — but only here: `getCoordinateFromView` converts density itself
  and must be given points on both.
*/
const IS_ANDROID = Platform.OS === 'android';
const QUERY_SCALE = IS_ANDROID ? PixelRatio.get() : 1;

/** How far a finger may slide and still have meant to tap, in points. */
const TAP_SLOP = 12;

/** The square around a tap that counts as hitting a station. */
function hitRect(x: number, y: number): [number, number, number, number] {
  const left = (x - STATION_HIT_RADIUS) * QUERY_SCALE;
  const right = (x + STATION_HIT_RADIUS) * QUERY_SCALE;
  const lower = (y - STATION_HIT_RADIUS) * QUERY_SCALE;
  const upper = (y + STATION_HIT_RADIUS) * QUERY_SCALE;

  return IS_ANDROID ? [lower, right, upper, left] : [upper, right, lower, left];
}

/** Reduces raw query results to the stations among them. */
function toCandidates(
  features: readonly GeoJSON.Feature[]
): StationCandidate[] {
  const candidates: StationCandidate[] = [];

  for (const feature of features) {
    if (feature.geometry.type !== 'Point') continue;

    const properties = feature.properties as StationFeatureProperties | null;
    const [longitude, latitude] = feature.geometry.coordinates;

    if (
      properties == null ||
      longitude === undefined ||
      latitude === undefined
    ) {
      continue;
    }

    candidates.push({ stopId: properties.stopId, longitude, latitude });
  }

  return candidates;
}

/**
 * The MapLibre Native map surface. See `map-view.web.tsx` for the web twin.
 *
 * Memoised, because both shape sources re-serialise their whole feature
 * collection to JSON on every render — an unrelated re-render of the screen
 * above would pay for every station and route again.
 */
export const MapView = memo(function MapView({
  stations,
  routes,
  focus,
  onStationPress,
  onBackgroundPress,
}: MapViewProps) {
  const theme = useTheme();
  const camera = useRef<CameraRef>(null);
  const map = useRef<MapViewRef>(null);

  // Callbacks are read through a ref so the tap gesture is built once and
  // never re-attached. Written after commit, never during render.
  const handlers = useRef({ onStationPress, onBackgroundPress });

  useEffect(() => {
    handlers.current = { onStationPress, onBackgroundPress };
  }, [onStationPress, onBackgroundPress]);

  useEffect(() => {
    if (focus === undefined) return;

    camera.current?.setCamera({
      centerCoordinate: [...focus.center],
      zoomLevel: focus.zoom,
      animationDuration: theme.durations.xMedium,
    });
  }, [focus, theme.durations.xMedium]);

  const handleHit = useCallback(
    (
      features: readonly GeoJSON.Feature[],
      target: readonly [longitude: number, latitude: number]
    ) => {
      const stopId = nearestStopId(toCandidates(features), target);

      if (stopId === undefined) {
        handlers.current.onBackgroundPress();
        return;
      }

      handlers.current.onStationPress(stopId);
    },
    []
  );

  // Stable, so the memoised stations source never re-renders — and so never
  // re-serialises every station — when a selection changes the routes.
  const handleSourcePress = useCallback(
    (event: OnPressEvent) => {
      handleHit(event.features, [
        event.coordinates.longitude,
        event.coordinates.latitude,
      ]);
    },
    [handleHit]
  );

  const handleTap = useCallback(
    async (x: number, y: number) => {
      const instance = map.current;
      if (instance === null) return;

      const [hit, target] = await Promise.all([
        instance.queryRenderedFeaturesInRect(hitRect(x, y), undefined, [
          LAYER_IDS.stationCircles,
        ]),
        instance.getCoordinateFromView([x, y]),
      ]);

      const [longitude, latitude] = target;
      if (longitude === undefined || latitude === undefined) return;

      handleHit(hit.features, [longitude, latitude]);
    },
    [handleHit]
  );

  // Where the tracked touch went down, or undefined once it has been ruled out
  // as a tap: a second finger, a drag, or a cancel.
  const touchOrigin = useRef<{ x: number; y: number } | undefined>(undefined);

  /*
    A passive reader of the touch stream, not a tap gesture — because a tap
    gesture has to *win* recognition, and over this map it cannot win quickly.
    The binding wires its own tap to fail-wait on the map's double-tap and
    two-finger-tap recognisers, and UIKit lets only one recogniser tracking a
    touch come out on top, so a competing tap either loses outright or is a
    third of a second late. `onTouches*` sidesteps the arbitration entirely:
    the callbacks run off the raw touches, so this resolves on touch-up while
    the map's own tap is still waiting to see whether a second one arrives.
    Recognising nothing is also what leaves panning, pinching and
    double-tap-to-zoom untouched — this gesture never activates.

    Which means the slop and multi-touch checks below are ours to make: without
    them, lifting a finger at the end of a pan would read as a tap.

    The source's own `onPress` below stays wired as the slow path, so a tap
    still lands if these never arrive. Both are safe to run for one tap because
    selecting a stop is idempotent.
  */
  const tap = useMemo(
    () =>
      Gesture.Manual()
        .runOnJS(true)
        .onTouchesDown((event) => {
          const touch = event.changedTouches[0];

          touchOrigin.current =
            event.numberOfTouches > 1 || touch === undefined
              ? undefined
              : { x: touch.x, y: touch.y };
        })
        .onTouchesMove((event) => {
          const origin = touchOrigin.current;
          const touch = event.changedTouches[0];
          if (origin === undefined || touch === undefined) return;

          if (
            Math.abs(touch.x - origin.x) > TAP_SLOP ||
            Math.abs(touch.y - origin.y) > TAP_SLOP
          ) {
            touchOrigin.current = undefined;
          }
        })
        .onTouchesUp((event) => {
          const origin = touchOrigin.current;
          touchOrigin.current = undefined;

          const touch = event.changedTouches[0];
          if (origin === undefined || touch === undefined) return;

          void handleTap(touch.x, touch.y);
        })
        .onTouchesCancelled(() => {
          touchOrigin.current = undefined;
        }),
    [handleTap]
  );

  return (
    <GestureDetector gesture={tap}>
      <View style={StyleSheet.absoluteFill}>
        <MapLibreMapView
          ref={map}
          style={StyleSheet.absoluteFill}
          mapStyle={BASEMAP_STYLE_URL}
          onPress={onBackgroundPress}
          // Attribution is rendered by our own legend, which the licences
          // require to stay visible — see `AttributionLegend`.
          attributionEnabled={false}
          logoEnabled={false}
          compassEnabled={false}
        >
          <Camera
            ref={camera}
            defaultSettings={{
              centerCoordinate: [...INITIAL_CENTER],
              zoomLevel: INITIAL_ZOOM,
            }}
            minZoomLevel={MIN_ZOOM}
          />

          {/* Routes sit beneath stations so markers stay tappable. */}
          <RoutesSource routes={routes} />

          <StationsSource stations={stations} onPress={handleSourcePress} />
        </MapLibreMapView>
      </View>
    </GestureDetector>
  );
});
