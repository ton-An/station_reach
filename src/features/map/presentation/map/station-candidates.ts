/**
 * A station rendered on the map that was matched by a hit test.
 */
export interface StationCandidate {
  readonly stopId: string;
  readonly longitude: number;
  readonly latitude: number;
}

/**
 * Extracts station candidates from GeoJSON features returned by a map query.
 *
 * Validates that each feature is a Point and has the required stopId property.
 *
 * @param features - GeoJSON features from a map hit test query.
 * @returns Array of valid station candidates.
 */
export function toStationCandidates(
  features: readonly GeoJSON.Feature[]
): StationCandidate[] {
  const candidates: StationCandidate[] = [];

  for (const feature of features) {
    if (feature.geometry.type !== 'Point') continue;

    const properties: Record<string, unknown> | null = feature.properties;
    const [longitude, latitude] = feature.geometry.coordinates;
    const stopId = properties?.stopId;

    if (
      typeof stopId !== 'string' ||
      longitude === undefined ||
      latitude === undefined
    ) {
      continue;
    }

    candidates.push({ stopId, longitude, latitude });
  }

  return candidates;
}

/**
 * Finds the stop ID of the station nearest to target coordinates.
 *
 * Calculates distance using equirectangular approximation, scaling longitude
 * by the cosine of latitude to account for meridian convergence.
 *
 * @param candidates - Stations to search.
 * @param target - World coordinates [longitude, latitude] to find the nearest
 * station to.
 * @returns The stop ID of the nearest candidate, or undefined if the list is
 * empty.
 */
export function nearestStopId(
  candidates: readonly StationCandidate[],
  target: readonly [longitude: number, latitude: number]
): string | undefined {
  const [targetLongitude, targetLatitude] = target;

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
