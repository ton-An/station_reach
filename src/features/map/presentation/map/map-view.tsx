import {
  Camera,
  CircleLayer,
  LineLayer,
  MapView as MapLibreMapView,
  ShapeSource,
  SymbolLayer,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

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
import type { StationFeatureProperties } from './map-data';
import type { MapViewProps } from './map-view.types';

/** The MapLibre Native map surface. See `map-view.web.tsx` for the web twin. */
export function MapView({
  stations,
  routes,
  focus,
  onStationPress,
  onBackgroundPress,
}: MapViewProps) {
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

  return (
    <MapLibreMapView
      style={StyleSheet.absoluteFill}
      mapStyle={BASEMAP_STYLE_URL}
      onPress={onBackgroundPress}
      // Attribution is rendered by our own legend, which the licences require
      // to stay visible — see `AttributionLegend`.
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
        hitbox={{ width: STATION_HIT_RADIUS, height: STATION_HIT_RADIUS }}
        onPress={(event) => {
          const properties = event.features[0]?.properties as
            StationFeatureProperties | undefined;

          if (properties !== undefined) onStationPress(properties.stopId);
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

        {/* MapLibre hides colliding labels itself — no clustering pass needed. */}
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
  );
}
