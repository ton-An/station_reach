import type { RouteFeatures, StationFeatures } from './map-features';

export interface MapFocus {
  readonly center: readonly [number, number];
  readonly zoom: number;
}

export interface MapViewProps {
  readonly stations: StationFeatures;
  readonly routes: RouteFeatures;
  readonly focus: MapFocus | undefined;
  readonly onStationPress: (stopId: string) => void;
  readonly onBackgroundPress: () => void;
}
