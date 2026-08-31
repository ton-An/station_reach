import {
  Camera,
  type CameraRef,
  MapView as MapLibreMapView,
  type MapViewRef,
  type OnPressEvent,
} from '@maplibre/maplibre-react-native';
import { memo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { useTheme } from '@/core/theme/use-theme';

import { MapRoutesSource } from './_map-routes-source';
import { MapStationsSource } from './_map-stations-source';
import { useMapTapGesture } from './_map-tap-gesture';
import {
  stationAtPoint,
  type StationHit,
  toStationHit,
} from './_station-hit-test';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MIN_ZOOM,
} from './map-config';
import type { MapViewProps } from './map-view.types';

/**
 * MapLibre Native implementation of {@link MapViewProps}.
 *
 * `Camera`'s `defaultSettings` only seed the initial position; a later
 * `focus` change moves the camera by calling `setCamera` through a ref.
 * `onStationPress` and `onBackgroundPress` are read from a ref kept in sync
 * on every render, so the tap gesture built from them is never recreated.
 */
export const MapView = memo(function MapView({
  stations,
  routes,
  focus,
  onStationPress,
  onBackgroundPress,
}: MapViewProps): React.JSX.Element {
  const theme = useTheme();
  const camera = useRef<CameraRef>(null);
  const map = useRef<MapViewRef>(null);

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

      void stationAtPoint({ map: instance, x, y }).then((hit) => {
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

          <MapRoutesSource routes={routes} />

          <MapStationsSource stations={stations} onPress={handleSourcePress} />
        </MapLibreMapView>
      </View>
    </GestureDetector>
  );
});
