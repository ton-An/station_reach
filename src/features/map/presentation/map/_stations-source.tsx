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
  LAYER_IDS,
  SOURCE_IDS,
  STATION_CIRCLE_RADIUS,
  STATION_HIT_RADIUS,
} from './map-config';
import type { StationFeatures } from './map-features';

/** Hoisted, so a fresh object never defeats the memo below. */
const HITBOX = {
  width: STATION_HIT_RADIUS * 2,
  height: STATION_HIT_RADIUS * 2,
};

interface StationsSourceProps {
  readonly stations: StationFeatures;
  /** Has to be referentially stable, or the memo below buys nothing. */
  readonly onPress: (event: OnPressEvent) => void;
}

/**
 * The reachable stations: one dot and one label each.
 *
 * Deliberately its own memoised component rather than a source inline in the
 * map. `ShapeSource` re-serialises its entire feature collection to JSON on
 * every render, and it cannot memoise that away itself — its children are
 * fresh elements each time, so its own `memo` never holds. Selecting a stop
 * changes only the routes, and re-stringifying several thousand stations
 * alongside them blocked the JS thread for a string React then diffed away.
 */
export const StationsSource = memo(function StationsSource({
  stations,
  onPress,
}: StationsSourceProps) {
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
  );
});
