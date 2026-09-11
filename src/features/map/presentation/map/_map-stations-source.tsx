import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { memo } from 'react';

import { useTheme } from '@/core/theme/use-theme';

import {
  LABEL_FONTS,
  LABEL_HALO_WIDTH,
  LABEL_OFFSET,
  LAYER_IDS,
  SOURCE_IDS,
  STATION_CIRCLE_RADIUS,
} from './map-config';
import type { StationFeatures } from './map-features';

interface MapStationsSourceProps {
  readonly stations: StationFeatures;
}

export const MapStationsSource = memo(function MapStationsSource({
  stations,
}: MapStationsSourceProps) {
  const theme = useTheme();

  return (
    <GeoJSONSource id={SOURCE_IDS.stations} data={stations}>
      <Layer
        id={LAYER_IDS.stationCircles}
        type="circle"
        paint={{
          'circle-radius': STATION_CIRCLE_RADIUS,
          'circle-color': ['get', 'color'],
          'circle-pitch-alignment': 'map',
        }}
      />

      <Layer
        id={LAYER_IDS.stationLabels}
        type="symbol"
        layout={{
          'text-field': ['get', 'name'],
          'text-font': LABEL_FONTS,
          'text-size': theme.text.caption1.fontSize,
          'text-anchor': 'top',
          'text-offset': [...LABEL_OFFSET],
          'text-allow-overlap': false,
          'text-optional': true,
        }}
        paint={{
          'text-color': theme.colors.text,
          'text-halo-color': theme.colors.background,
          'text-halo-width': LABEL_HALO_WIDTH,
        }}
      />
    </GeoJSONSource>
  );
});
