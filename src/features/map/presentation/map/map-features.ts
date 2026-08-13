import { colorForDuration } from '@/core/helpers/color-helper';
import type { Departure } from '../../domain/models/departure';
import type { StopIndex } from './stop-index';

export type StationFeatureProperties = {
  stopId: string;
  name: string;
  durationMinutes: number;
  color: string;
};

export type RouteFeatureProperties = {
  departureId: string;
  color: string;
  offset: number;
};

export type PointFeature<P> = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: P;
};

export type LineFeature<P> = {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: P;
};

export type FeatureCollection<F> = {
  type: 'FeatureCollection';
  features: F[];
};

export type StationFeatures = FeatureCollection<
  PointFeature<StationFeatureProperties>
>;
export type RouteFeatures = FeatureCollection<
  LineFeature<RouteFeatureProperties>
>;

export const EMPTY_STATIONS: StationFeatures = {
  type: 'FeatureCollection',
  features: [],
};

export const EMPTY_ROUTES: RouteFeatures = {
  type: 'FeatureCollection',
  features: [],
};

const MAX_FAN_OFFSET = 10;

const STATION_ALPHA = 0.75;
const ROUTE_ALPHA = 0.7;

export function buildStationFeatures(
  stops: StopIndex,
  gradient: readonly string[]
): StationFeatures {
  const features = [...stops.values()].map(
    ({ stop }): PointFeature<StationFeatureProperties> => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [stop.longitude, stop.latitude] },
      properties: {
        stopId: stop.id,
        name: stop.name,
        durationMinutes: stop.durationMinutes,
        color: colorForDuration({
          gradient,
          durationMinutes: stop.durationMinutes,
          alpha: STATION_ALPHA,
        }),
      },
    })
  );

  return { type: 'FeatureCollection', features };
}

export function buildRouteFeatures(
  departures: readonly Departure[],
  gradient: readonly string[]
): RouteFeatures {
  const features: LineFeature<RouteFeatureProperties>[] = [];
  const middle = departures.length / 2;

  departures.forEach((departure, departureIndex) => {
    const offset = Math.min(
      Math.max(middle - departureIndex, 0),
      MAX_FAN_OFFSET
    );

    for (let i = 0; i < departure.stops.length - 1; i++) {
      const from = departure.stops[i];
      const to = departure.stops[i + 1];
      if (from === undefined || to === undefined) continue;

      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [from.longitude, from.latitude],
            [to.longitude, to.latitude],
          ],
        },
        properties: {
          departureId: departure.id,
          color: colorForDuration({
            gradient,
            durationMinutes: to.durationMinutes,
            alpha: ROUTE_ALPHA,
          }),
          offset,
        },
      });
    }
  });

  return { type: 'FeatureCollection', features };
}
