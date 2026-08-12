import type { RouteFeatures, StationFeatures } from './map-features';

/** Where the camera should sit. A new object identity re-issues the move. */
export interface MapFocus {
  readonly center: readonly [number, number];
  readonly zoom: number;
}

/**
 * The map surface.
 *
 * Implemented twice — `map-view.tsx` drives MapLibre Native, `map-view.web.tsx`
 * drives MapLibre GL JS — against this one contract, so the screen above never
 * branches on platform.
 */
export interface MapViewProps {
  readonly stations: StationFeatures;
  readonly routes: RouteFeatures;
  readonly focus: MapFocus | undefined;
  /** A reachable station was tapped. */
  readonly onStationPress: (stopId: string) => void;
  /** The map was tapped somewhere that isn't a station. */
  readonly onBackgroundPress: () => void;
}
