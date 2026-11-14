import type { Stop } from '../../domain/models/station';

/**
 * A station a station callout labels: what the card says, and the coordinate
 * it hangs from.
 */
export interface StationCalloutTarget {
  /** The stop id, so two targets only compare equal for the same stop. */
  readonly id: string;
  readonly name: string;
  /** Minutes from the selected station's departure to this stop. */
  readonly durationMinutes: number;
  /** `[longitude, latitude]`, GeoJSON order. */
  readonly center: readonly [number, number];
}

/**
 * Builds the target for the stop selected on the map.
 *
 * @param stop - The selected stop.
 */
export function calloutTargetForStop(stop: Stop): StationCalloutTarget {
  return {
    id: stop.id,
    name: stop.name,
    durationMinutes: stop.durationMinutes,
    center: [stop.longitude, stop.latitude],
  };
}

/**
 * Builds the target for a station feature returned by a web hit-test,
 * reading the properties `buildStationFeatures` wrote onto it.
 *
 * @param feature - The feature the pointer is over.
 * @returns The target, or `undefined` when the feature is not a station
 * point carrying the properties a callout needs.
 */
export function calloutTargetForFeature(
  feature: GeoJSON.Feature
): StationCalloutTarget | undefined {
  if (feature.geometry.type !== 'Point') return undefined;

  const id: unknown = feature.properties?.stopId;
  const name: unknown = feature.properties?.name;
  const durationMinutes: unknown = feature.properties?.durationMinutes;
  const [longitude, latitude] = feature.geometry.coordinates;

  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof durationMinutes !== 'number' ||
    longitude === undefined ||
    latitude === undefined
  ) {
    return undefined;
  }

  return { id, name, durationMinutes, center: [longitude, latitude] };
}
