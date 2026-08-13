import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import {
  LABEL_FONTS,
  LABEL_HALO_WIDTH,
  LABEL_OFFSET,
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

interface LabelStyle {
  readonly size: number;
  readonly color: string;
  readonly haloColor: string;
}

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
      'text-offset': [...LABEL_OFFSET],
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

interface SyncSourcesParams {
  readonly instance: MapLibreMap;
  readonly stations: StationFeatures;
  readonly routes: RouteFeatures;
}

export function syncSources({
  instance,
  stations,
  routes,
}: SyncSourcesParams): void {
  instance.getSource<GeoJSONSource>(SOURCE_IDS.stations)?.setData(stations);
  instance.getSource<GeoJSONSource>(SOURCE_IDS.routes)?.setData(routes);
}
