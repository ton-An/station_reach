import {
  Camera,
  CircleLayer,
  LineLayer,
  MapView as MapLibreMapView,
  ShapeSource,
  SymbolLayer,
  type CameraRef,
  type MapViewRef,
} from '@maplibre/maplibre-react-native';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { PixelRatio, Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useTheme } from '@/core/theme/use-theme';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  LABEL_FONTS,
  LAYER_IDS,
  LINE_OFFSET_EXPRESSION,
  MIN_ZOOM,
  ROUTE_LINE_WIDTH,
  SOURCE_IDS,
  STATION_CIRCLE_RADIUS,
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

  /*
    Two paths lead here, and both are safe to run for the same tap because
    selecting a stop is idempotent.

    The gesture is the fast one: the binding wires its own tap recogniser to
    fail-wait on the map's double-tap and two-finger-tap recognisers, which is a
    third of a second of nothing happening before a station can even be looked
    up. Ours fires on touch-up. Leaving the map's recognisers their touches
    (`cancelsTouchesInView`) is what keeps double-tap-to-zoom working; the cost
    is that the first tap of one also registers.

    The source's own `onPress` below stays wired as the slow path, so a tap
    still lands if the gesture never recognises.
  */
  const tap = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .cancelsTouchesInView(false)
        .onEnd((event, success) => {
          if (success) void handleTap(event.x, event.y);
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
          <ShapeSource id={SOURCE_IDS.routes} shape={routes}>
            <LineLayer
              id={LAYER_IDS.routeLines}
              style={{
                lineColor: ['get', 'color'],
                lineWidth: ROUTE_LINE_WIDTH,
                lineCap: 'round',
                lineJoin: 'round',
                // One cast: the two MapLibre bindings declare structurally
                // identical expression types under different names.
                lineOffset: LINE_OFFSET_EXPRESSION as unknown as number,
              }}
            />
          </ShapeSource>

          <ShapeSource
            id={SOURCE_IDS.stations}
            shape={stations}
            hitbox={{
              width: STATION_HIT_RADIUS * 2,
              height: STATION_HIT_RADIUS * 2,
            }}
            onPress={(event) => {
              handleHit(event.features, [
                event.coordinates.longitude,
                event.coordinates.latitude,
              ]);
            }}
          >
            <CircleLayer
              id={LAYER_IDS.stationCircles}
              style={{
                circleRadius: STATION_CIRCLE_RADIUS,
                circleColor: ['get', 'color'],
                circlePitchAlignment: 'map',
              }}
            />

            {/* MapLibre hides colliding labels itself — no clustering pass. */}
            <SymbolLayer
              id={LAYER_IDS.stationLabels}
              style={{
                textField: ['get', 'name'],
                textFont: LABEL_FONTS,
                textSize: theme.text.caption1.fontSize,
                textAnchor: 'top',
                textOffset: [0, 0.6],
                textColor: theme.colors.text,
                textHaloColor: theme.colors.background,
                textHaloWidth: 1.5,
                textAllowOverlap: false,
                textOptional: true,
              }}
            />
          </ShapeSource>
        </MapLibreMapView>
      </View>
    </GestureDetector>
  );
});
