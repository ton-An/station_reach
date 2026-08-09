import { colorForDuration } from '@/core/helpers/color-helper';
import type { Departure } from '../../domain/models/departure';
import type { Stop } from '../../domain/models/station';

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

/** A station the hit test turned up, reduced to what picking a winner needs. */
export interface StationCandidate {
  readonly stopId: string;
  readonly longitude: number;
  readonly latitude: number;
}

/**
 * Picks the station nearest a tap.
 *
 * The hit area is much larger than the dot, so in a dense area a single tap
 * matches several stations at once. Taking whichever the query happened to
 * return first selects by draw order — that is, a neighbour rather than the dot
 * under the finger, which is what made tapping feel unpredictable.
 *
 * Parameters:
 * - candidates: every station the hit test matched
 * - target: where the tap landed, as `[longitude, latitude]`
 *
 * Returns:
 * - the id of the closest station, or undefined if nothing was hit
 */
export function nearestStopId(
  candidates: readonly StationCandidate[],
  target: readonly [longitude: number, latitude: number]
): string | undefined {
  const [targetLongitude, targetLatitude] = target;

  // A degree of longitude is shorter than a degree of latitude everywhere but
  // the equator; comparing them raw biases the pick east-west.
  const longitudeScale = Math.cos((targetLatitude * Math.PI) / 180);

  let nearest: string | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const dx = (candidate.longitude - targetLongitude) * longitudeScale;
    const dy = candidate.latitude - targetLatitude;
    const distance = dx * dx + dy * dy;

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = candidate.stopId;
    }
  }

  return nearest;
}

/** Everything the map needs to know about one reachable stop. */
export interface StopEntry {
  /** The fastest arrival at this stop across every departure. */
  readonly stop: Stop;
  /** The departures that call here, in load order. */
  readonly departures: readonly Departure[];
}

/** Reachable stops by id. */
export type StopIndex = ReadonlyMap<string, StopEntry>;

/** The mutable shape the index is assembled through. */
interface MutableStopEntry {
  stop: Stop;
  departures: Departure[];
}

/**
 * Indexes the loaded departures by the stops they call at.
 *
 * Built once per reachability set so that tapping a station is a lookup rather
 * than a scan: the naive version walked every departure's every stop twice on
 * each tap, which is tens of thousands of comparisons before anything paints.
 *
 * Parameters:
 * - departures: every departure loaded for the origin station
 *
 * Returns:
 * - one entry per reachable stop, holding its fastest arrival and its trips
 */
export function buildStopIndex(departures: readonly Departure[]): StopIndex {
  const index = new Map<string, MutableStopEntry>();

  for (const departure of departures) {
    // A circular route calls at the same stop twice and must still be listed
    // against it once.
    const seen = new Set<string>();

    for (const stop of departure.stops) {
      const entry = index.get(stop.id);

      if (entry === undefined) {
        index.set(stop.id, { stop, departures: [departure] });
      } else {
        if (stop.durationMinutes < entry.stop.durationMinutes) {
          entry.stop = stop;
        }
        if (!seen.has(stop.id)) entry.departures.push(departure);
      }

      seen.add(stop.id);
    }
  }

  return index;
}

/**
 * Builds the reachable-station points for the map.
 *
 * A station served by several departures is drawn once, at the *shortest*
 * travel time — the map answers "how fast can I get there", not "how slowly" —
 * which is what the index already resolved.
 *
 * Parameters:
 * - stops: the indexed reachability set
 * - gradient: the travel-time ramp to colour by
 *
 * Returns:
 * - one point feature per reachable station
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
        color: colorForDuration(gradient, stop.durationMinutes, 0.75),
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
 * Parameters:
 * - departures: the departures to draw
 * - gradient: the travel-time ramp to colour by
 *
 * Returns:
 * - one line feature per leg
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
          color: colorForDuration(gradient, to.durationMinutes, 0.7),
          offset,
        },
      });
    }
  });

  return { type: 'FeatureCollection', features };
}
