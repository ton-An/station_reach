import {
  LineLayer,
  ShapeSource,
  type Expression,
} from '@maplibre/maplibre-react-native';
import { memo } from 'react';

import {
  LAYER_IDS,
  LINE_OFFSET_EXPRESSION,
  ROUTE_LINE_WIDTH,
  SOURCE_IDS,
} from './map-config';
import type { RouteFeatures } from './map-features';

interface RoutesSourceProps {
  readonly routes: RouteFeatures;
}

/**
 * Renders departure route lines on the map.
 */
export const RoutesSource = memo(function RoutesSource({
  routes,
}: RoutesSourceProps) {
  return (
    <ShapeSource id={SOURCE_IDS.routes} shape={routes}>
      <LineLayer
        id={LAYER_IDS.routeLines}
        style={{
          lineColor: ['get', 'color'],
          lineWidth: ROUTE_LINE_WIDTH,
          lineCap: 'round',
          lineJoin: 'round',
          lineOffset: LINE_OFFSET_EXPRESSION as Expression,
        }}
      />
    </ShapeSource>
  );
});
