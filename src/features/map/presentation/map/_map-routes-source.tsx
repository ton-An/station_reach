import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { memo } from 'react';

import {
  LAYER_IDS,
  LINE_OFFSET_EXPRESSION,
  ROUTE_LINE_WIDTH,
  SOURCE_IDS,
} from './map-config';
import type { RouteFeatures } from './map-features';

interface MapRoutesSourceProps {
  readonly routes: RouteFeatures;
}

export const MapRoutesSource = memo(function MapRoutesSource({
  routes,
}: MapRoutesSourceProps) {
  return (
    <GeoJSONSource id={SOURCE_IDS.routes} data={routes}>
      <Layer
        id={LAYER_IDS.routeLines}
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{
          'line-color': ['get', 'color'],
          'line-width': ROUTE_LINE_WIDTH,
          'line-offset': LINE_OFFSET_EXPRESSION,
        }}
      />
    </GeoJSONSource>
  );
});
