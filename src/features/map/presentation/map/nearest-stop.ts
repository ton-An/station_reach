/**
 * Picks the station marker nearest the tapped point, so a tap within
 * several overlapping markers' hit radius resolves to the closest one.
 *
 * Longitude is scaled by `cos(latitude)` before comparing, so distance
 * approximates ground distance instead of raw degree deltas.
 *
 * @param features - Candidate features from a hit-test query.
 * @param target - The tapped point, as `[longitude, latitude]`.
 * @returns The nearest station's stop id, or `undefined` when no feature
 * qualifies.
 */
export function nearestStopId(
  features: readonly GeoJSON.Feature[],
  target: readonly [longitude: number, latitude: number]
): string | undefined {
  const [targetLongitude, targetLatitude] = target;
  const longitudeScale = Math.cos((targetLatitude * Math.PI) / 180);

  let nearest: string | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const { geometry, properties } of features) {
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
      nearest = stopId;
    }
  }

  return nearest;
}
