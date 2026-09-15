import type {
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
  Point,
} from 'maplibre-gl';

import { LAYER_IDS, STATION_HIT_RADIUS } from './map-config';
import { nearestStopId } from './nearest-stop';

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

interface TrackStationPointerParams {
  readonly instance: MapLibreMap;
  /**
   * Delay before clearing the pointer cursor, in milliseconds, once the
   * pointer stops being over a marker.
   */
  readonly holdMs: number;
  /**
   * Called with the hovered marker's stop id, and with `undefined` once no
   * marker is hovered. Fires only when the answer changes, not on every
   * pointer move.
   */
  readonly onHover: (stopId: string | undefined) => void;
}

/**
 * Tracks what the pointer is over: it sets the canvas cursor to a pointer
 * while a station marker is under it, and reports which marker that is.
 *
 * The cursor is cleared `holdMs` after the pointer stops being over a
 * marker rather than immediately, so it does not flicker between markers
 * spaced close together. The hover report is not held back that way — a
 * callout following the pointer has to leave as soon as the marker does.
 *
 * @returns A cleanup function that removes the listeners and cancels a
 * pending clear.
 */
export function trackStationPointer({
  instance,
  holdMs,
  onHover,
}: TrackStationPointerParams): () => void {
  let hold: ReturnType<typeof setTimeout> | undefined;
  let hovered: string | undefined;

  const setHovered = (stopId: string | undefined) => {
    if (stopId === hovered) return;

    hovered = stopId;
    onHover(stopId);
  };

  const onMouseMove = (event: MapMouseEvent) => {
    const canvas = instance.getCanvas();
    const stopId = nearestStopId(stationsAt(instance, event.point), [
      event.lngLat.lng,
      event.lngLat.lat,
    ]);

    setHovered(stopId);

    if (stopId !== undefined) {
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

  const onMouseOut = () => setHovered(undefined);

  instance.on('mousemove', onMouseMove);
  instance.on('mouseout', onMouseOut);

  return () => {
    clearTimeout(hold);
    instance.off('mousemove', onMouseMove);
    instance.off('mouseout', onMouseOut);
  };
}
