import { LineLayer, ShapeSource } from '@maplibre/maplibre-react-native';
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
 * The legs of the departures calling at the selected stop.
 *
 * Memoised for the same reason {@link StationsSource} is: this is the half of
 * the map that actually changes on a tap, and keeping the two apart means only
 * this one pays to serialise itself again.
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
          // One cast: the two MapLibre bindings declare structurally identical
          // expression types under different names.
          lineOffset: LINE_OFFSET_EXPRESSION as unknown as number,
        }}
      />
    </ShapeSource>
  );
});
