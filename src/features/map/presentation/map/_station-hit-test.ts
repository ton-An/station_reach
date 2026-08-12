import type { MapViewRef } from '@maplibre/maplibre-react-native';
import { PixelRatio, Platform } from 'react-native';

import { LAYER_IDS, STATION_HIT_RADIUS } from './map-config';
import { nearestStopId, toStationCandidates } from './station-candidates';

/*
  The feature query takes a rect in the map view's own coordinate system, which
  the two bindings disagree about. iOS builds a `CGRect` as
  `(left, bottom, right - left, top - bottom)` and so needs `top` to be the
  larger y; Android sets a `RectF` straight from the same array and needs it to
  be the smaller one. Android also measures in raw pixels where iOS measures in
  view points — but only here: `getCoordinateFromView` converts density itself
  and must be given points on both.
*/
const IS_ANDROID = Platform.OS === 'android';
const QUERY_SCALE = IS_ANDROID ? PixelRatio.get() : 1;

/** What a tap on the map turned out to be. */
export type StationHit =
  | { readonly kind: 'station'; readonly stopId: string }
  | { readonly kind: 'background' };

/** The square around a tap that counts as hitting a station. */
function hitRect(x: number, y: number): [number, number, number, number] {
  const left = (x - STATION_HIT_RADIUS) * QUERY_SCALE;
  const right = (x + STATION_HIT_RADIUS) * QUERY_SCALE;
  const lower = (y - STATION_HIT_RADIUS) * QUERY_SCALE;
  const upper = (y + STATION_HIT_RADIUS) * QUERY_SCALE;

  return IS_ANDROID ? [lower, right, upper, left] : [upper, right, lower, left];
}

/**
 * Resolves an already-queried feature set against the point that produced it.
 *
 * The hit area is much larger than the drawn dot, so a single tap in a dense
 * area matches several stations at once and the nearest one wins — see
 * {@link nearestStopId}.
 *
 * Parameters:
 * - features: whatever the query returned for the tap
 * - target: where the tap landed, as `[longitude, latitude]`
 *
 * Returns:
 * - the station under the tap, or the background
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

/**
 * Resolves a point on the native map to whatever is under it.
 *
 * Queries a box rather than the point: the box is what makes the target bigger
 * than the 6.3px circle, and a point query is too tight to hit a dot at all.
 *
 * Parameters:
 * - map: the live map instance
 * - x, y: where the touch landed, in view points
 *
 * Returns:
 * - the hit, or undefined if the map could not place the touch — which means
 *   "leave the selection alone", not "the background was tapped"
 */
export async function stationAtPoint(
  map: MapViewRef,
  x: number,
  y: number
): Promise<StationHit | undefined> {
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
