import type { StationFeatureProperties } from './map-features';

/** A station the hit test turned up, reduced to what picking a winner needs. */
export interface StationCandidate {
  readonly stopId: string;
  readonly longitude: number;
  readonly latitude: number;
}

/**
 * Reduces raw hit-test results to the stations among them.
 *
 * Both map bindings answer a query with GeoJSON features and both need the same
 * three fields back, so the reduction lives here rather than once per platform.
 * Anything that isn't a point with our properties on it is dropped: the query is
 * layer-scoped, but nothing in the type system says so.
 *
 * Parameters:
 * - features: whatever the binding's rendered-feature query returned
 *
 * Returns:
 * - one candidate per usable station feature
 */
export function toStationCandidates(
  features: readonly GeoJSON.Feature[]
): StationCandidate[] {
  const candidates: StationCandidate[] = [];

  for (const feature of features) {
    if (feature.geometry.type !== 'Point') continue;

    const properties = feature.properties as StationFeatureProperties | null;
    const [longitude, latitude] = feature.geometry.coordinates;

    if (
      properties == null ||
      longitude === undefined ||
      latitude === undefined
    ) {
      continue;
    }

    candidates.push({ stopId: properties.stopId, longitude, latitude });
  }

  return candidates;
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
