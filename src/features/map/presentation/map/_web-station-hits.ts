import type { Map as MapLibreMap, MapMouseEvent, Point } from 'maplibre-gl';

import { LAYER_IDS, STATION_HIT_RADIUS } from './map-config';
import {
  toStationCandidates,
  type StationCandidate,
} from './station-candidates';

/**
 * Finds station candidates at the given point on a MapLibre GL JS map.
 *
 * @param instance - The MapLibre GL JS map to query.
 * @param point - Screen coordinates to query around.
 * @returns Stations rendered within the hit radius of the point.
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
 * Tracks mouse movement and shows a pointer cursor when over stations.
 *
 * The cursor does not revert immediately when leaving a station to avoid
 * visual noise during cursor hovering. Instead, it reverts after holdMs
 * milliseconds of not being over a station.
 *
 * @param instance - The MapLibre GL JS map to track on.
 * @param holdMs - Milliseconds to wait before reverting the cursor.
 * @returns A cleanup function that removes the mouse movement listener.
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
