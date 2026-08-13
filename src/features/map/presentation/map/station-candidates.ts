export interface StationCandidate {
  readonly stopId: string;
  readonly longitude: number;
  readonly latitude: number;
}

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
