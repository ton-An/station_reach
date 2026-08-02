import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
  type MapMouseEvent,
} from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';

import { useTheme } from '@/core/theme/use-theme';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  LABEL_FONTS,
  LAYER_IDS,
  LINE_OFFSET_EXPRESSION,
  MIN_ZOOM,
  ROUTE_LINE_WIDTH,
  SOURCE_IDS,
  STATION_CIRCLE_RADIUS,
  STATION_HIT_RADIUS,
} from './map-config';
import {
  EMPTY_ROUTES,
  EMPTY_STATIONS,
  type StationFeatureProperties,
} from './map-data';
import type { MapViewProps } from './map-view.types';

/** The MapLibre GL JS map surface. See `map-view.tsx` for the native twin. */
export function MapView({
  stations,
  routes,
  focus,
  onStationPress,
  onBackgroundPress,
}: MapViewProps) {
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap>(null);
  const isStyleLoaded = useRef(false);

  // Callbacks are read through a ref so re-renders never re-bind map handlers.
  // Updated in an effect rather than during render, so the ref is only ever
  // written after commit.
  const handlers = useRef({ onStationPress, onBackgroundPress });

  useEffect(() => {
    handlers.current = { onStationPress, onBackgroundPress };
  }, [onStationPress, onBackgroundPress]);

  useEffect(() => {
    if (container.current === null) return;

    const instance = new maplibregl.Map({
      container: container.current,
      style: BASEMAP_STYLE_URL,
      center: [...INITIAL_CENTER],
      zoom: INITIAL_ZOOM,
      minZoom: MIN_ZOOM,
      // Our own legend carries the required attribution.
      attributionControl: false,
    });

    map.current = instance;

    if (__DEV__) {
      // Reach the live map from the browser console while developing.
      (globalThis as { __map?: MapLibreMap }).__map = instance;
    }

    // MapLibre swallows tile and style errors otherwise, which makes a blank
    // map impossible to diagnose.
    instance.on('error', (event) => {
      console.error('[map]', event.error?.message ?? event);
    });

    // `load` fires once and only if we were listening in time. With a warm
    // cache the style can already be up by the time this effect commits, so
    // check first and fall back to the event.
    const registerLayers = () => {
      if (isStyleLoaded.current) return;

      addLayers(instance, theme.text.caption1.fontSize, theme.colors);
      isStyleLoaded.current = true;
      syncSources(instance, stations, routes);
    };

    if (instance.isStyleLoaded()) {
      registerLayers();
    } else {
      instance.once('styledata', registerLayers);
      instance.once('load', registerLayers);
    }

    instance.on(
      'click',
      LAYER_IDS.stationCircles,
      (event: MapLayerMouseEvent) => {
        const properties = event.features?.[0]?.properties as
          StationFeatureProperties | undefined;

        if (properties === undefined) return;

        // Don't also fire the background handler for this same click.
        event.preventDefault();
        handlers.current.onStationPress(properties.stopId);
      }
    );

    instance.on('click', (event: MapMouseEvent) => {
      if (event.defaultPrevented) return;
      handlers.current.onBackgroundPress();
    });

    instance.on('mouseenter', LAYER_IDS.stationCircles, () => {
      instance.getCanvas().style.cursor = 'pointer';
    });
    instance.on('mouseleave', LAYER_IDS.stationCircles, () => {
      instance.getCanvas().style.cursor = '';
    });

    // The map is constructed before React Native Web has laid the container
    // out, so without this the canvas keeps MapLibre's 400x300 default and
    // only the top-left corner of the map ever paints.
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      isStyleLoaded.current = false;
      map.current = null;
      instance.remove();
    };
    // Built once; data and camera are pushed in by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (map.current === null || !isStyleLoaded.current) return;
    syncSources(map.current, stations, routes);
  }, [stations, routes]);

  useEffect(() => {
    if (map.current === null || focus === undefined) return;

    map.current.easeTo({
      center: [...focus.center],
      zoom: focus.zoom,
      duration: theme.durations.xMedium,
    });
  }, [focus, theme.durations.xMedium]);

  return <div ref={container} style={{ position: 'absolute', inset: 0 }} />;
}

/** Registers the sources and layers. Runs once, on style load. */
function addLayers(
  instance: MapLibreMap,
  labelSize: number,
  colors: { text: string; background: string }
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
    paint: {
      'circle-radius': STATION_CIRCLE_RADIUS,
      'circle-color': ['get', 'color'],
      // Invisible stroke widening the click target, matching native's hitbox.
      'circle-stroke-width': STATION_HIT_RADIUS,
      'circle-stroke-color': 'rgba(0, 0, 0, 0)',
    },
  });

  instance.addLayer({
    id: LAYER_IDS.stationLabels,
    type: 'symbol',
    source: SOURCE_IDS.stations,
    layout: {
      'text-field': ['get', 'name'],
      'text-font': LABEL_FONTS,
      'text-size': labelSize,
      'text-anchor': 'top',
      'text-offset': [0, 0.6],
      // MapLibre drops colliding labels itself — no clustering pass needed.
      'text-allow-overlap': false,
      'text-optional': true,
    },
    paint: {
      'text-color': colors.text,
      'text-halo-color': colors.background,
      'text-halo-width': 1.5,
    },
  });
}

/** Pushes the current feature collections into the map's sources. */
function syncSources(
  instance: MapLibreMap,
  stations: MapViewProps['stations'],
  routes: MapViewProps['routes']
): void {
  instance.getSource<GeoJSONSource>(SOURCE_IDS.stations)?.setData(stations);
  instance.getSource<GeoJSONSource>(SOURCE_IDS.routes)?.setData(routes);
}
