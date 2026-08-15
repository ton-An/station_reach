export interface StationCandidate {
  readonly stopId: string;
  readonly longitude: number;
  readonly latitude: number;
}

/**
 * Narrows a rendered-feature query's results to station markers — a point
 * geometry with a string `stopId` property and defined coordinates.
 * Anything else, a route line or a malformed feature, is dropped.
 *
 * @param features - Features returned by a rendered-feature query.
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
 * Picks the candidate nearest the tapped point, so a tap within several
 * overlapping markers' hit radius resolves to the closest one instead of
 * an arbitrary pick.
 *
 * Longitude is scaled by `cos(latitude)` before comparing, so distance
 * approximates ground distance instead of raw degree deltas.
 *
 * @param candidates - The markers within tap tolerance.
 * @param target - The tapped point, as `[longitude, latitude]`.
 * @returns The nearest candidate's stop id, or `undefined` when
 * `candidates` is empty.
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
