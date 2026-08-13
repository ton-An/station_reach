import type { RouteFeatures, StationFeatures } from './map-features';

/**
 * Specifies where to center and zoom the map.
 */
export interface MapFocus {
  readonly center: readonly [number, number];
  readonly zoom: number;
}

/**
 * Props contract for the map view, shared between native and web
 * implementations.
 */
export interface MapViewProps {
  readonly stations: StationFeatures;
  readonly routes: RouteFeatures;
  readonly focus: MapFocus | undefined;
  readonly onStationPress: (stopId: string) => void;
  readonly onBackgroundPress: () => void;
}
