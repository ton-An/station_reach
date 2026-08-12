import {
  Camera,
  MapView as MapLibreMapView,
  type CameraRef,
  type MapViewRef,
  type OnPressEvent,
} from '@maplibre/maplibre-react-native';
import { memo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { useTheme } from '@/core/theme/use-theme';
import { useMapTapGesture } from './_map-tap-gesture';
import { RoutesSource } from './_routes-source';
import {
  stationAtPoint,
  toStationHit,
  type StationHit,
} from './_station-hit-test';
import { StationsSource } from './_stations-source';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MIN_ZOOM,
} from './map-config';
import type { MapViewProps } from './map-view.types';

/**
 * The MapLibre Native map surface. See `map-view.web.tsx` for the web twin.
 *
 * Memoised, because both shape sources re-serialise their whole feature
 * collection to JSON on every render — an unrelated re-render of the screen
 * above would pay for every station and route again.
 *
 * ! Two tap paths run into the same lookup, and both may fire for one tap. The
 * slow one is the shape source's own `onPress`; the fast one is
 * {@link useMapTapGesture}, which reads the touch stream directly because the
 * source's recogniser cannot resolve for a third of a second. Selecting a stop
 * is idempotent — see `station-selection-store` — which is what makes running
 * both safe. Don't collapse them into one without checking the delay stays gone.
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

  const applyHit = useCallback((hit: StationHit) => {
    if (hit.kind === 'background') {
      handlers.current.onBackgroundPress();
      return;
    }

    handlers.current.onStationPress(hit.stopId);
  }, []);

  // Stable, so the memoised stations source never re-renders — and so never
  // re-serialises every station — when a selection changes the routes.
  const handleSourcePress = useCallback(
    (event: OnPressEvent) => {
      applyHit(
        toStationHit(event.features, [
          event.coordinates.longitude,
          event.coordinates.latitude,
        ])
      );
    },
    [applyHit]
  );

  const handleTap = useCallback(
    (x: number, y: number) => {
      const instance = map.current;
      if (instance === null) return;

      void stationAtPoint(instance, x, y).then((hit) => {
        if (hit !== undefined) applyHit(hit);
      });
    },
    [applyHit]
  );

  const tap = useMapTapGesture(handleTap);

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
