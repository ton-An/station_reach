import maplibregl, {
  type Map as MapLibreMap,
  type MapMouseEvent,
} from 'maplibre-gl';
import { memo, useEffect, useRef } from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';

import { useTheme } from '@/core/theme/use-theme';
import { addStationLayers, syncSources } from './_web-map-style';
import { stationsAt, trackStationCursor } from './_web-station-hits';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MIN_ZOOM,
} from './map-config';
import { nearestStopId } from './station-candidates';
import type { MapViewProps } from './map-view.types';

declare global {
  var __map: MapLibreMap | undefined;
}

/**
 * The MapLibre GL JS map surface. See `map-view.tsx` for the native twin.
 *
 * Memoised to match it: an unrelated re-render of the screen above pushes both
 * feature collections back into the map for nothing.
 */
export const MapView = memo(function MapView({
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

  // The style can finish loading after a feature collection has arrived, and
  // the registration below runs out of an effect that closed over the mount
  // render — so it reads the collections through a ref rather than dropping
  // whatever landed in between.
  const data = useRef({ stations, routes });

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

    if (__DEV__) globalThis.__map = instance;

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

      addStationLayers(instance, {
        size: theme.text.caption1.fontSize,
        color: theme.colors.text,
        haloColor: theme.colors.background,
      });
      isStyleLoaded.current = true;
      syncSources({ instance, ...data.current });
    };

    if (instance.isStyleLoaded()) {
      registerLayers();
    } else {
      instance.once('styledata', registerLayers);
      instance.once('load', registerLayers);
    }

    /*
      One handler, not a layer-scoped one plus a background one: the layer-
      scoped variant hit-tests the rendered circle, which meant the tap target
      could only be widened by giving every dot a transparent stroke — and then
      a click in a dense area returned whichever of the overlapping strokes drew
      last rather than the dot nearest the cursor.
    */
    instance.on('click', (event: MapMouseEvent) => {
      const stopId = nearestStopId(stationsAt(instance, event.point), [
        event.lngLat.lng,
        event.lngLat.lat,
      ]);

      if (stopId === undefined) {
        handlers.current.onBackgroundPress();
        return;
      }

      handlers.current.onStationPress(stopId);
    });

    const untrackCursor = trackStationCursor(instance, theme.durations.xxTiny);

    // The map is constructed before React Native Web has laid the container
    // out, so without this the canvas keeps MapLibre's 400x300 default and
    // only the top-left corner of the map ever paints.
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      untrackCursor();
      isStyleLoaded.current = false;
      map.current = null;
      instance.remove();
    };
    // Built once; data and camera are pushed in by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    data.current = { stations, routes };

    if (map.current === null || !isStyleLoaded.current) return;
    syncSources({ instance: map.current, stations, routes });
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
});
