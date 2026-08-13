import {
  CircleLayer,
  ShapeSource,
  SymbolLayer,
  type OnPressEvent,
} from '@maplibre/maplibre-react-native';
import { memo } from 'react';

import { useTheme } from '@/core/theme/use-theme';
import {
  LABEL_FONTS,
  LABEL_HALO_WIDTH,
  LABEL_OFFSET,
  LAYER_IDS,
  SOURCE_IDS,
  STATION_CIRCLE_RADIUS,
  STATION_HIT_RADIUS,
} from './map-config';
import type { StationFeatures } from './map-features';

const HITBOX = {
  width: STATION_HIT_RADIUS * 2,
  height: STATION_HIT_RADIUS * 2,
};

interface MapStationsSourceProps {
  readonly stations: StationFeatures;
  readonly onPress: (event: OnPressEvent) => void;
}

/**
 * Renders reachable station markers with labels on the map.
 */
export const MapStationsSource = memo(function MapStationsSource({
  stations,
  onPress,
}: MapStationsSourceProps) {
  const theme = useTheme();

  return (
    <ShapeSource
      id={SOURCE_IDS.stations}
      shape={stations}
      hitbox={HITBOX}
      onPress={onPress}
    >
      <CircleLayer
        id={LAYER_IDS.stationCircles}
        style={{
          circleRadius: STATION_CIRCLE_RADIUS,
          circleColor: ['get', 'color'],
          circlePitchAlignment: 'map',
        }}
      />

      <SymbolLayer
        id={LAYER_IDS.stationLabels}
        style={{
          textField: ['get', 'name'],
          textFont: LABEL_FONTS,
          textSize: theme.text.caption1.fontSize,
          textAnchor: 'top',
          textOffset: [...LABEL_OFFSET],
          textColor: theme.colors.text,
          textHaloColor: theme.colors.background,
          textHaloWidth: LABEL_HALO_WIDTH,
          textAllowOverlap: false,
          textOptional: true,
        }}
      />
    </ShapeSource>
  );
});
