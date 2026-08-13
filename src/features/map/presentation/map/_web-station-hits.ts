import type { Map as MapLibreMap, MapMouseEvent, Point } from 'maplibre-gl';

import { LAYER_IDS, STATION_HIT_RADIUS } from './map-config';
import {
  toStationCandidates,
  type StationCandidate,
} from './station-candidates';

/**
 * The stations within reach of a point on screen.
 *
 * A box rather than the point itself: the drawn dot is far smaller than the
 * area that should answer to a click, and hit-testing the dot is what made both
 * clicking and the cursor feel unreliable.
 *
 * @param instance - The live map.
 * @param point - Where the pointer is, in canvas pixels.
 * @returns Every station whose dot falls inside the hit box.
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
 * Turns the cursor into a pointer over anything clickable.
 *
 * ! Runs off the same box as the click, not off `mouseenter` / `mouseleave` on
 * the circle layer. Those hit-test the drawn dot at `STATION_CIRCLE_RADIUS`, so
 * the pointer flickered on and off as the cursor crossed its edge — and it lied
 * besides, staying default over most of the area a click would actually hit.
 *
 * Dropping back to `grab` is then held for a moment, because the boxes of two
 * neighbouring stations stop just short of touching: at a typical zoom they
 * leave a gap only a few pixels wide, and sweeping along a line of stations
 * blinked the cursor once per gap. Crossing one takes far less than the hold, so
 * the gaps vanish while leaving the stations still reads immediately.
 *
 * @param instance - The live map.
 * @param holdMs - How long to keep the pointer after leaving a station.
 * @returns A teardown that unbinds the handler and cancels any pending hold.
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
