import {
  Camera,
  type CameraRef,
  Map as MapLibreMap,
  type MapRef,
} from '@maplibre/maplibre-react-native';
import { memo, useCallback, useEffect, useRef } from 'react';
import { type GestureResponderEvent, StyleSheet } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

import { MapRoutesSource } from './_map-routes-source';
import { MapStationsSource } from './_map-stations-source';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  LAYER_IDS,
  MIN_ZOOM,
  STATION_HIT_RADIUS,
  TAP_MOVE_TOLERANCE,
} from './map-config';
import type { MapViewProps } from './map-view.types';
import { nearestStopId } from './nearest-stop';

/**
 * MapLibre Native implementation of {@link MapViewProps}.
 *
 * Taps are detected from the plain React Native touch events instead of the
 * library's press events. Both native platforms deliver a press only after
 * the double-tap window has passed — iOS chains the tap recognizer behind
 * the double-tap recognizers, Android dispatches from
 * `onSingleTapConfirmed` — so a press arrives ~300 ms late. A touch that
 * ends without moving or gaining a second finger is hit-tested immediately
 * through {@link MapRef.queryRenderedFeatures}; the first tap of a
 * double-tap therefore selects, and the second zooms.
 *
 * `Camera`'s `initialViewState` only seeds the initial position; a later
 * `focus` change moves the camera by calling `easeTo` through a ref.
 */
export const MapView = memo(function MapView({
  stations,
  routes,
  focus,
  onStationPress,
}: MapViewProps): React.JSX.Element {
  const theme = useTheme();
  const camera = useRef<CameraRef>(null);
  const map = useRef<MapRef>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (focus === undefined) return;

    camera.current?.easeTo({
      center: [...focus.center],
      zoom: focus.zoom,
      duration: theme.durations.xMedium,
    });
  }, [focus, theme.durations.xMedium]);

  const handleTap = useCallback(
    async (x: number, y: number) => {
      const instance = map.current;
      if (instance === null) return;

      const [features, lngLat] = await Promise.all([
        instance.queryRenderedFeatures(
          [
            [x - STATION_HIT_RADIUS, y - STATION_HIT_RADIUS],
            [x + STATION_HIT_RADIUS, y + STATION_HIT_RADIUS],
          ],
          { layers: [LAYER_IDS.stationCircles] }
        ),
        instance.unproject([x, y]),
      ]);

      const stopId = nearestStopId(features, lngLat);
      if (stopId === undefined) return;

      onStationPress(stopId);
    },
    [onStationPress]
  );

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    const { touches, locationX, locationY } = event.nativeEvent;

    touchStart.current =
      touches.length > 1 ? null : { x: locationX, y: locationY };
  }, []);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    if (touchStart.current === null) return;

    const { touches, locationX, locationY } = event.nativeEvent;

    if (
      touches.length > 1 ||
      Math.abs(locationX - touchStart.current.x) > TAP_MOVE_TOLERANCE ||
      Math.abs(locationY - touchStart.current.y) > TAP_MOVE_TOLERANCE
    ) {
      touchStart.current = null;
    }
  }, []);

  const handleTouchCancel = useCallback(() => {
    touchStart.current = null;
  }, []);

  const handleTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      if (touchStart.current === null) return;
      touchStart.current = null;

      const { locationX, locationY } = event.nativeEvent;

      // A tap before the style has loaded has nothing to hit; the query
      // rejecting is that same answer, not an error to surface.
      handleTap(locationX, locationY).catch(() => undefined);
    },
    [handleTap]
  );

  return (
    <MapLibreMap
      ref={map}
      style={StyleSheet.absoluteFill}
      mapStyle={BASEMAP_STYLE_URL}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      attribution={false}
      logo={false}
      compass={false}
    >
      <Camera
        ref={camera}
        initialViewState={{
          center: [...INITIAL_CENTER],
          zoom: INITIAL_ZOOM,
        }}
        minZoom={MIN_ZOOM}
      />

      <MapRoutesSource routes={routes} />

      <MapStationsSource stations={stations} />
    </MapLibreMap>
  );
});
