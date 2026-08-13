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

export const MapView = memo(function MapView({
  stations,
  routes,
  focus,
  onStationPress,
  onBackgroundPress,
}: MapViewProps): React.JSX.Element {
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap>(null);
  const isStyleLoaded = useRef(false);

  const data = useRef({ stations, routes });

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
      attributionControl: false,
    });

    map.current = instance;

    if (__DEV__) globalThis.__map = instance;

    instance.on('error', (event) => {
      console.error('[map]', event.error?.message ?? event);
    });

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

    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      untrackCursor();
      isStyleLoaded.current = false;
      map.current = null;
      instance.remove();
    };
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
