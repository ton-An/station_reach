/** A station feature a hit-test resolved to, with its stop id read out. */
export interface NearestStop {
  readonly feature: GeoJSON.Feature;
  readonly stopId: string;
}

/**
 * Picks the station marker nearest the given point, so a query that catches
 * several overlapping markers resolves to the closest one.
 *
 * Longitude is scaled by `cos(latitude)` before comparing, so distance
 * approximates ground distance instead of raw degree deltas.
 *
 * @param features - Candidate features from a hit-test query.
 * @param target - The point to measure from, as `[longitude, latitude]`.
 * @returns The nearest station feature and its stop id, or `undefined` when
 * no feature qualifies.
 */
export function nearestStop(
  features: readonly GeoJSON.Feature[],
  target: readonly [longitude: number, latitude: number]
): NearestStop | undefined {
  const [targetLongitude, targetLatitude] = target;
  const longitudeScale = Math.cos((targetLatitude * Math.PI) / 180);

  let nearest: NearestStop | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const feature of features) {
    const { geometry, properties } = feature;
    if (geometry.type !== 'Point') continue;

    const [longitude, latitude] = geometry.coordinates;
    const stopId: unknown = properties?.stopId;

    if (
      typeof stopId !== 'string' ||
      longitude === undefined ||
      latitude === undefined
    ) {
      continue;
    }

    const dx = (longitude - targetLongitude) * longitudeScale;
    const dy = latitude - targetLatitude;
    const distance = dx * dx + dy * dy;

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { feature, stopId };
    }
  }

  return nearest;
}
