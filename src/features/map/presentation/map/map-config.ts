import type { ExpressionSpecification } from 'maplibre-gl';

export const BASEMAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

export const LABEL_FONTS = ['Open Sans Regular', 'Noto Sans Regular'];

export const LABEL_HALO_WIDTH = 1.5;
export const LABEL_OFFSET: readonly [number, number] = [0, 0.6];

export const INITIAL_CENTER: readonly [number, number] = [10.127, 42.68];
export const INITIAL_ZOOM = 4;
export const MIN_ZOOM = 1.5;

export const FOCUSED_ZOOM = 6;

export const FOCUS_LATITUDE_OFFSET = -1;

export const SOURCE_IDS = {
  stations: 'reachable-stations',
  routes: 'departure-routes',
} as const;

export const LAYER_IDS = {
  stationCircles: 'reachable-station-circles',
  stationLabels: 'reachable-station-labels',
  routeLines: 'departure-route-lines',
} as const;

export const STATION_CIRCLE_RADIUS = 6.3;
export const STATION_HIT_RADIUS = 24;

export const ROUTE_LINE_WIDTH = 5;

export const LINE_OFFSET_EXPRESSION: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  0,
  ['*', ['get', 'offset'], 0],
  7,
  ['*', ['get', 'offset'], 1],
  14,
  ['*', ['get', 'offset'], 4],
];
