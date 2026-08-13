import type { MapViewRef } from '@maplibre/maplibre-react-native';
import { PixelRatio, Platform } from 'react-native';

import { LAYER_IDS, STATION_HIT_RADIUS } from './map-config';
import { nearestStopId, toStationCandidates } from './station-candidates';

const IS_ANDROID = Platform.OS === 'android';
const QUERY_SCALE = IS_ANDROID ? PixelRatio.get() : 1;

/** What a tap on the map turned out to be. */
export type StationHit =
  | { readonly kind: 'station'; readonly stopId: string }
  | { readonly kind: 'background' };

/**
 * The square around a tap that counts as hitting a station.
 *
 * The two bindings disagree about the rect. Android wants
 * `[minY, maxX, maxY, minX]` in raw pixels, and iOS wants
 * `[maxY, maxX, minY, minX]` in view points.
 */
function hitRect(x: number, y: number): [number, number, number, number] {
  const left = (x - STATION_HIT_RADIUS) * QUERY_SCALE;
  const right = (x + STATION_HIT_RADIUS) * QUERY_SCALE;
  const lower = (y - STATION_HIT_RADIUS) * QUERY_SCALE;
  const upper = (y + STATION_HIT_RADIUS) * QUERY_SCALE;

  return IS_ANDROID ? [lower, right, upper, left] : [upper, right, lower, left];
}

/**
 * Finds the nearest station to the target coordinates from rendered features.
 *
 * @param features - GeoJSON features from a map query rect.
 * @param target - World coordinates (longitude, latitude) to find the
 * nearest station to.
 * @returns Either a hit station by its stop ID or a background hit.
 */
export function toStationHit(
  features: readonly GeoJSON.Feature[],
  target: readonly [longitude: number, latitude: number]
): StationHit {
  const stopId = nearestStopId(toStationCandidates(features), target);

  return stopId === undefined
    ? { kind: 'background' }
    : { kind: 'station', stopId };
}

interface StationAtPointParams {
  readonly map: MapViewRef;
  readonly x: number;
  readonly y: number;
}

/**
 * Queries the map for a station at the given screen coordinates.
 *
 * @param map - The MapLibre Native map instance to query.
 * @param x - Screen X coordinate in points.
 * @param y - Screen Y coordinate in points.
 * @returns The nearest station in the hit rect, or undefined if the
 * coordinate conversion fails.
 */
export async function stationAtPoint({
  map,
  x,
  y,
}: StationAtPointParams): Promise<StationHit | undefined> {
  const [hit, target] = await Promise.all([
    map.queryRenderedFeaturesInRect(hitRect(x, y), undefined, [
      LAYER_IDS.stationCircles,
    ]),
    map.getCoordinateFromView([x, y]),
  ]);

  const [longitude, latitude] = target;
  if (longitude === undefined || latitude === undefined) return undefined;

  return toStationHit(hit.features, [longitude, latitude]);
}
