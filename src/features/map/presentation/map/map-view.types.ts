import type { RouteFeatures, StationFeatures } from './map-features';

/** The camera position a {@link MapViewProps.focus} change animates to. */
export interface MapFocus {
  /** `[longitude, latitude]`, GeoJSON order. */
  readonly center: readonly [number, number];
  readonly zoom: number;
}

/**
 * The platform-agnostic contract `map-view.tsx` (MapLibre Native) and
 * `map-view.web.tsx` (MapLibre GL JS) both implement.
 */
export interface MapViewProps {
  /** Every reachable station to draw, already coloured by travel time. */
  readonly stations: StationFeatures;
  /** The selected departure's route lines; empty when nothing is selected. */
  readonly routes: RouteFeatures;
  /** Camera position to animate to. `undefined` leaves the camera as-is. */
  readonly focus: MapFocus | undefined;
  /**
   * Fires with a station's stop id when a tap hits its marker. A tap that
   * misses every marker fires nothing.
   */
  readonly onStationPress: (stopId: string) => void;
}
