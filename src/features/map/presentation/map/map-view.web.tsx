import 'maplibre-gl/dist/maplibre-gl.css';

import maplibregl, {
  type Map as MapLibreMap,
  type MapMouseEvent,
} from 'maplibre-gl';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTheme } from '@/core/theme/use-theme';

import { StationCallout } from '../components/station-callout';
import { addStationLayers, syncSources } from './_web-map-style';
import { stationsAt, trackStationPointer } from './_web-station-hits';
import {
  BASEMAP_STYLE_URL,
  CALLOUT_OFFSET,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MIN_ZOOM,
} from './map-config';
import { calloutTarget } from './map-features';
import type { MapViewProps } from './map-view.types';
import { nearestStopId } from './nearest-stop';

declare global {
  var __map: MapLibreMap | undefined;
}

/**
 * MapLibre GL JS implementation of {@link MapViewProps}.
 *
 * The callout is a `Marker` carrying a node this component portals
 * {@link StationCallout} into, so the card is styled from the theme like
 * the rest of the app's chrome while MapLibre keeps it pinned to its
 * coordinate. A hovered marker outranks `calloutStopId`, which puts the
 * card under the pointer as it sweeps the map.
 */
export const MapView = memo(function MapView({
  stations,
  routes,
  focus,
  calloutStopId,
  onStationPress,
}: MapViewProps): React.JSX.Element {
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap>(null);
  const isStyleLoaded = useRef(false);

  const [calloutNode, setCalloutNode] = useState<HTMLDivElement | null>(null);
  const [hoveredStopId, setHoveredStopId] = useState<string | undefined>(
    undefined
  );

  const callout = useMemo(
    () => calloutTarget(stations, hoveredStopId ?? calloutStopId),
    [stations, hoveredStopId, calloutStopId]
  );

  const data = useRef({ stations, routes });

  const handlers = useRef({ onStationPress });

  useEffect(() => {
    handlers.current = { onStationPress };
  }, [onStationPress]);

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
      if (stopId === undefined) return;

      handlers.current.onStationPress(stopId);
    });

    const untrackPointer = trackStationPointer({
      instance,
      holdMs: theme.durations.xxTiny,
      onHover: setHoveredStopId,
    });

    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      untrackPointer();
      isStyleLoaded.current = false;
      map.current = null;
      instance.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Built here rather than at render: the document does not exist while
    // the page is rendered statically, before hydration.
    const node = document.createElement('div');
    // The card sits over the markers it labels. Taking the pointer there
    // would hide the marker from the hit test and make the card flicker.
    node.style.pointerEvents = 'none';

    setCalloutNode(node);
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (instance === null || calloutNode === null || callout === undefined) {
      return;
    }

    const marker = new maplibregl.Marker({
      element: calloutNode,
      anchor: 'bottom',
      offset: [...CALLOUT_OFFSET],
    })
      .setLngLat([...callout.center])
      .addTo(instance);

    return () => {
      marker.remove();
    };
  }, [callout, calloutNode]);

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

  return (
    <>
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />

      {calloutNode !== null &&
        callout !== undefined &&
        createPortal(
          <StationCallout
            name={callout.name}
            durationMinutes={callout.durationMinutes}
          />,
          calloutNode
        )}
    </>
  );
});
