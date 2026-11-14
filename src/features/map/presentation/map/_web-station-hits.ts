import type {
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
  Point,
} from 'maplibre-gl';

import { LAYER_IDS, STATION_HIT_RADIUS } from './map-config';
import { type NearestStop, nearestStop } from './nearest-stop';

/**
 * Station markers within {@link STATION_HIT_RADIUS} px of `point`, the
 * same tap tolerance the native platform uses.
 *
 * @param instance - The map to query.
 * @param point - The screen point to search around.
 */
export function stationsAt(
  instance: MapLibreMap,
  point: Point
): MapGeoJSONFeature[] {
  const { x, y } = point;

  return instance.queryRenderedFeatures(
    [
      [x - STATION_HIT_RADIUS, y - STATION_HIT_RADIUS],
      [x + STATION_HIT_RADIUS, y + STATION_HIT_RADIUS],
    ],
    { layers: [LAYER_IDS.stationCircles] }
  );
}

/**
 * Reports the station marker under the pointer through `onStationChange`,
 * and sets the canvas cursor to a pointer while there is one.
 *
 * The cursor clears `holdMs` after the pointer leaves a station instead of
 * immediately, so it does not flicker between markers spaced close together.
 * The reported station changes at once, because a card labelling a marker
 * has to leave when its marker does.
 *
 * @param instance - The map to track the pointer on.
 * @param holdMs - Delay before the pointer cursor clears, in milliseconds.
 * @param onStationChange - Called with the station under the pointer, or
 * `undefined` when there is none.
 * @returns A cleanup function that removes the listener and cancels a
 * pending cursor clear.
 */
export function trackStationPointer({
  instance,
  holdMs,
  onStationChange,
}: {
  readonly instance: MapLibreMap;
  readonly holdMs: number;
  readonly onStationChange: (station: NearestStop | undefined) => void;
}): () => void {
  let hold: ReturnType<typeof setTimeout> | undefined;
  let current: string | undefined;

  const onMouseMove = (event: MapMouseEvent) => {
    const canvas = instance.getCanvas();
    const station = nearestStop(stationsAt(instance, event.point), [
      event.lngLat.lng,
      event.lngLat.lat,
    ]);

    if (station !== undefined) {
      clearTimeout(hold);
      hold = undefined;

      if (canvas.style.cursor !== 'pointer') canvas.style.cursor = 'pointer';
    } else if (canvas.style.cursor === 'pointer' && hold === undefined) {
      hold = setTimeout(() => {
        hold = undefined;
        canvas.style.cursor = '';
      }, holdMs);
    }

    if (station?.stopId === current) return;

    current = station?.stopId;
    onStationChange(station);
  };

  instance.on('mousemove', onMouseMove);

  return () => {
    clearTimeout(hold);
    instance.off('mousemove', onMouseMove);
  };
}
