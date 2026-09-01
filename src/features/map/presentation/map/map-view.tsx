import {
  Camera,
  type CameraRef,
  MapView as MapLibreMapView,
  type OnPressEvent,
} from '@maplibre/maplibre-react-native';
import { memo, useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

import { MapRoutesSource } from './_map-routes-source';
import { MapStationsSource } from './_map-stations-source';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MIN_ZOOM,
} from './map-config';
import type { MapViewProps } from './map-view.types';
import { nearestStopId } from './nearest-stop';

/**
 * MapLibre Native implementation of {@link MapViewProps}.
 *
 * A tap on a station marker arrives as the stations source's press, a tap
 * anywhere else as the map's own press. `Camera`'s `defaultSettings` only
 * seed the initial position; a later `focus` change moves the camera by
 * calling `setCamera` through a ref.
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

  useEffect(() => {
    if (focus === undefined) return;

    camera.current?.setCamera({
      centerCoordinate: [...focus.center],
      zoomLevel: focus.zoom,
      animationDuration: theme.durations.xMedium,
    });
  }, [focus, theme.durations.xMedium]);

  const handleStationsPress = useCallback(
    (event: OnPressEvent) => {
      const stopId = nearestStopId(event.features, [
        event.coordinates.longitude,
        event.coordinates.latitude,
      ]);

      if (stopId === undefined) {
        onBackgroundPress();
        return;
      }

      onStationPress(stopId);
    },
    [onStationPress, onBackgroundPress]
  );

  return (
    <MapLibreMapView
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

      <MapStationsSource stations={stations} onPress={handleStationsPress} />
    </MapLibreMapView>
  );
});
