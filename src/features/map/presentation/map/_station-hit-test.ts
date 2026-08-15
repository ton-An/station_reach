import type { MapViewRef } from '@maplibre/maplibre-react-native';
import { PixelRatio, Platform } from 'react-native';

import { LAYER_IDS, STATION_HIT_RADIUS } from './map-config';
import { nearestStopId, toStationCandidates } from './station-candidates';

const IS_ANDROID = Platform.OS === 'android';
const QUERY_SCALE = IS_ANDROID ? PixelRatio.get() : 1;

export type StationHit =
  | { readonly kind: 'station'; readonly stopId: string }
  | { readonly kind: 'background' };

/**
 * Builds the query rect around a tap, in the units and axis order the
 * native `queryRenderedFeaturesInRect` call expects on each platform:
 * device pixels on Android, points on iOS, with top and bottom swapped
 * between the two.
 */
function hitRect(x: number, y: number): [number, number, number, number] {
  const left = (x - STATION_HIT_RADIUS) * QUERY_SCALE;
  const right = (x + STATION_HIT_RADIUS) * QUERY_SCALE;
  const lower = (y - STATION_HIT_RADIUS) * QUERY_SCALE;
  const upper = (y + STATION_HIT_RADIUS) * QUERY_SCALE;

  return IS_ANDROID ? [lower, right, upper, left] : [upper, right, lower, left];
}

/**
 * Classifies a hit test's result as a station press or a background press:
 * the nearest station within tap tolerance, or `background` when there is
 * none.
 *
 * @param features - Candidate features from a hit-test query.
 * @param target - The tapped point, as `[longitude, latitude]`.
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
 * Resolves a native tap at view coordinates `x, y` to a {@link StationHit}.
 *
 * Queries the rendered station features and the tapped point's map
 * coordinate concurrently, since both are async native calls.
 *
 * @returns The hit, or `undefined` when the point falls outside the map
 * and no coordinate resolves.
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
