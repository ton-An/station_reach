import type { Map as MapLibreMap, MapMouseEvent, Point } from 'maplibre-gl';

import { LAYER_IDS, STATION_HIT_RADIUS } from './map-config';
import {
  toStationCandidates,
  type StationCandidate,
} from './station-candidates';

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
): StationCandidate[] {
  const { x, y } = point;

  return toStationCandidates(
    instance.queryRenderedFeatures(
      [
        [x - STATION_HIT_RADIUS, y - STATION_HIT_RADIUS],
        [x + STATION_HIT_RADIUS, y + STATION_HIT_RADIUS],
      ],
      { layers: [LAYER_IDS.stationCircles] }
    )
  );
}

/**
 * Sets the canvas cursor to a pointer while the mouse is over a station
 * marker, and clears it `holdMs` after it stops being over one instead of
 * immediately, so the cursor does not flicker between markers spaced
 * close together.
 *
 * @param instance - The map to track hover on.
 * @param holdMs - Delay before clearing the pointer cursor, in
 * milliseconds.
 * @returns A cleanup function that removes the listener and cancels a
 * pending clear.
 */
export function trackStationCursor(
  instance: MapLibreMap,
  holdMs: number
): () => void {
  let hold: ReturnType<typeof setTimeout> | undefined;

  const onMouseMove = (event: MapMouseEvent) => {
    const canvas = instance.getCanvas();

    if (stationsAt(instance, event.point).length > 0) {
      clearTimeout(hold);
      hold = undefined;

      if (canvas.style.cursor !== 'pointer') canvas.style.cursor = 'pointer';
      return;
    }

    if (canvas.style.cursor !== 'pointer' || hold !== undefined) return;

    hold = setTimeout(() => {
      hold = undefined;
      canvas.style.cursor = '';
    }, holdMs);
  };

  instance.on('mousemove', onMouseMove);

  return () => {
    clearTimeout(hold);
    instance.off('mousemove', onMouseMove);
  };
}
