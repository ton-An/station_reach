/*
  To-Do:
    - [ ] Self-host the basemap style if CARTO ever rate-limits us. The glyph
          endpoint it points at is what makes station labels possible.
*/

import type { ExpressionSpecification } from 'maplibre-gl';

/**
 * The basemap.
 *
 * CARTO Voyager, same look the Flutter app used — but the vector style rather
 * than the raster tiles, because a raster style carries no glyphs and MapLibre
 * cannot render station name labels without them.
 */
export const BASEMAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

/** A fontstack the CARTO glyph endpoint actually serves. */
export const LABEL_FONTS = ['Open Sans Regular', 'Noto Sans Regular'];

// MapLibre hides colliding station labels itself — no clustering pass.
export const LABEL_HALO_WIDTH = 1.5;
export const LABEL_OFFSET: readonly [number, number] = [0, 0.6];

/** Roughly centred on Europe, zoomed out far enough to show the continent. */
export const INITIAL_CENTER: readonly [number, number] = [10.127, 42.68];
export const INITIAL_ZOOM = 4;
export const MIN_ZOOM = 1.5;

/** Where the camera goes once a station's reachability has loaded. */
export const FOCUSED_ZOOM = 6;

/**
 * The camera is dropped a degree south of the origin station so the departures
 * modal, which covers the bottom of the screen, doesn't sit on top of it.
 */
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

/**
 * The visible dot is small, but the touch target is not.
 *
 * The Flutter markers carried a transparent 26px border purely to widen the hit
 * area. Here it is a radius around the tap instead — both platforms query the
 * square that circumscribes it and then take the nearest dot inside, so a
 * generous target never costs you the station you actually aimed at.
 */
export const STATION_CIRCLE_RADIUS = 6.3;
export const STATION_HIT_RADIUS = 24;

export const ROUTE_LINE_WIDTH = 5;

/**
 * How far apart overlapping trips are fanned, by zoom.
 *
 * Zoomed out, parallel routes must stay legible as separate lines; zoomed in
 * they should sit close to their true geometry. Mirrors the Flutter painter's
 * `clamp((zoom / 7)^2, 0, 4)` shift, but perpendicular to the line rather than
 * diagonal, which separates parallel routes more evenly.
 *
 * The zoom interpolation has to be the *outermost* expression — MapLibre
 * rejects `["zoom"]` nested inside another operator — so the per-feature offset
 * is multiplied into each stop's output rather than applied around the whole
 * thing.
 */
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
