import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import {
  LABEL_FONTS,
  LAYER_IDS,
  LINE_OFFSET_EXPRESSION,
  ROUTE_LINE_WIDTH,
  SOURCE_IDS,
  STATION_CIRCLE_RADIUS,
} from './map-config';
import {
  EMPTY_ROUTES,
  EMPTY_STATIONS,
  type RouteFeatures,
  type StationFeatures,
} from './map-features';

/** How thick the halo around a station label is. */
const LABEL_HALO_WIDTH = 1.5;

interface LabelStyle {
  readonly size: number;
  readonly color: string;
  readonly haloColor: string;
}

/**
 * Registers the app's sources and layers on the basemap style.
 *
 * Runs once, on style load — MapLibre drops everything added to a style when it
 * is replaced, and this one never is.
 *
 * Parameters:
 * - instance: the live map
 * - label: how station name labels are drawn
 */
export function addStationLayers(
  instance: MapLibreMap,
  label: LabelStyle
): void {
  instance.addSource(SOURCE_IDS.routes, {
    type: 'geojson',
    data: EMPTY_ROUTES,
  });
  instance.addSource(SOURCE_IDS.stations, {
    type: 'geojson',
    data: EMPTY_STATIONS,
  });

  // Routes beneath stations, so markers stay clickable.
  instance.addLayer({
    id: LAYER_IDS.routeLines,
    type: 'line',
    source: SOURCE_IDS.routes,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ROUTE_LINE_WIDTH,
      'line-offset': LINE_OFFSET_EXPRESSION,
    },
  });

  instance.addLayer({
    id: LAYER_IDS.stationCircles,
    type: 'circle',
    source: SOURCE_IDS.stations,
    // No invisible stroke widening the click target any more — the click
    // handler queries a box around the cursor instead, so the drawn circle can
    // be exactly the circle we mean to draw.
    paint: {
      'circle-radius': STATION_CIRCLE_RADIUS,
      'circle-color': ['get', 'color'],
    },
  });

  instance.addLayer({
    id: LAYER_IDS.stationLabels,
    type: 'symbol',
    source: SOURCE_IDS.stations,
    layout: {
      'text-field': ['get', 'name'],
      'text-font': LABEL_FONTS,
      'text-size': label.size,
      'text-anchor': 'top',
      'text-offset': [0, 0.6],
      // MapLibre drops colliding labels itself — no clustering pass needed.
      'text-allow-overlap': false,
      'text-optional': true,
    },
    paint: {
      'text-color': label.color,
      'text-halo-color': label.haloColor,
      'text-halo-width': LABEL_HALO_WIDTH,
    },
  });
}

/**
 * Pushes the current feature collections into the map's sources.
 *
 * `setData` takes the object as it stands, so unlike the native binding this
 * costs nothing per station — there is no serialisation to memoise away.
 */
export function syncSources(
  instance: MapLibreMap,
  stations: StationFeatures,
  routes: RouteFeatures
): void {
  instance.getSource<GeoJSONSource>(SOURCE_IDS.stations)?.setData(stations);
  instance.getSource<GeoJSONSource>(SOURCE_IDS.routes)?.setData(routes);
}
