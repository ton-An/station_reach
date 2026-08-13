import { colorForDuration } from '@/core/helpers/color-helper';
import type { Departure } from '../../domain/models/departure';
import type { StopIndex } from './stop-index';

/*
  These shapes are handed straight to MapLibre, so they are declared as type
  aliases with mutable arrays — GeoJSON's own types are mutable, and an
  interface would not satisfy its `GeoJsonProperties` index signature.
*/

/** What the circle and label layers read off each station feature. */
export type StationFeatureProperties = {
  stopId: string;
  name: string;
  durationMinutes: number;
  color: string;
};

/** What the route line layer reads off each leg feature. */
export type RouteFeatureProperties = {
  departureId: string;
  color: string;
  /** Perpendicular fan-out, so parallel trips stay distinguishable. */
  offset: number;
};

export type PointFeature<P> = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: P;
};

export type LineFeature<P> = {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: P;
};

export type FeatureCollection<F> = {
  type: 'FeatureCollection';
  features: F[];
};

export type StationFeatures = FeatureCollection<
  PointFeature<StationFeatureProperties>
>;
export type RouteFeatures = FeatureCollection<
  LineFeature<RouteFeatureProperties>
>;

export const EMPTY_STATIONS: StationFeatures = {
  type: 'FeatureCollection',
  features: [],
};

export const EMPTY_ROUTES: RouteFeatures = {
  type: 'FeatureCollection',
  features: [],
};

/** How far a fanned line may be pushed aside, in offset units. */
const MAX_FAN_OFFSET = 10;

/** How much of the ramp survives in a station dot and in a route line. */
const STATION_ALPHA = 0.75;
const ROUTE_ALPHA = 0.7;

/**
 * Builds the reachable-station points for the map.
 *
 * A station served by several departures is drawn once, at the *shortest*
 * travel time — the map answers "how fast can I get there", not "how slowly" —
 * which is what the index already resolved.
 *
 * @param stops - The indexed reachability set.
 * @param gradient - The travel-time ramp to colour by.
 * @returns One point feature per reachable station.
 */
export function buildStationFeatures(
  stops: StopIndex,
  gradient: readonly string[]
): StationFeatures {
  const features = [...stops.values()].map(
    ({ stop }): PointFeature<StationFeatureProperties> => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [stop.longitude, stop.latitude] },
      properties: {
        stopId: stop.id,
        name: stop.name,
        durationMinutes: stop.durationMinutes,
        color: colorForDuration({
          gradient,
          durationMinutes: stop.durationMinutes,
          alpha: STATION_ALPHA,
        }),
      },
    })
  );

  return { type: 'FeatureCollection', features };
}

/**
 * Builds the route lines for the departures calling at the selected stop.
 *
 * One feature per leg rather than per trip, because the colour ramps along the
 * journey: a leg carries the travel time from the origin to the stop it arrives
 * at, so it always matches the marker at its far end and the line reads green →
 * red the further the trip gets. A leg's own length is deliberately *not* what
 * colours it — a long hop early on is still a short journey.
 *
 * @param departures - The departures to draw.
 * @param gradient - The travel-time ramp to colour by.
 * @returns One line feature per leg.
 */
export function buildRouteFeatures(
  departures: readonly Departure[],
  gradient: readonly string[]
): RouteFeatures {
  const features: LineFeature<RouteFeatureProperties>[] = [];
  const middle = departures.length / 2;

  departures.forEach((departure, departureIndex) => {
    const offset = Math.min(
      Math.max(middle - departureIndex, 0),
      MAX_FAN_OFFSET
    );

    for (let i = 0; i < departure.stops.length - 1; i++) {
      const from = departure.stops[i];
      const to = departure.stops[i + 1];
      if (from === undefined || to === undefined) continue;

      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [from.longitude, from.latitude],
            [to.longitude, to.latitude],
          ],
        },
        properties: {
          departureId: departure.id,
          color: colorForDuration({
            gradient,
            durationMinutes: to.durationMinutes,
            alpha: ROUTE_ALPHA,
          }),
          offset,
        },
      });
    }
  });

  return { type: 'FeatureCollection', features };
}
