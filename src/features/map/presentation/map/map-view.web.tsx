import 'maplibre-gl/dist/maplibre-gl.css';

import maplibregl, {
  type Map as MapLibreMap,
  type MapMouseEvent,
} from 'maplibre-gl';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { useTheme } from '@/core/theme/use-theme';

import { useStationSelectionStore } from '../stores/use-map-stores';
import { MapCallouts } from './_web-map-callouts';
import { addStationLayers, syncSources } from './_web-map-style';
import { stationsAt, trackStationPointer } from './_web-station-hits';
import {
  BASEMAP_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MIN_ZOOM,
} from './map-config';
import type { MapViewProps } from './map-view.types';
import { type NearestStop, nearestStop } from './nearest-stop';
import {
  calloutTargetForFeature,
  calloutTargetForStop,
  type StationCalloutTarget,
} from './station-callout-target';

declare global {
  var __map: MapLibreMap | undefined;
}

/**
 * MapLibre GL JS implementation of {@link MapViewProps}.
 *
 * The selected stop and the station under the pointer each get a callout, so
 * a hover never hides the stop the user tapped. {@link MapCallouts} anchors
 * them.
 */
export const MapView = memo(function MapView({
  stations,
  routes,
  focus,
  onStationPress,
}: MapViewProps): React.JSX.Element {
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap>(null);
  const isStyleLoaded = useRef(false);

  const data = useRef({ stations, routes });

  const handlers = useRef({ onStationPress });

  const selectedStop = useStationSelectionStore((store) =>
    store.state.status === 'selected' ? store.state.selectedStop : undefined
  );
  const [hovered, setHovered] = useState<NearestStop | undefined>();

  const callouts = useMemo(() => {
    const targets: StationCalloutTarget[] = [];

    if (selectedStop !== undefined) {
      targets.push(calloutTargetForStop(selectedStop));
    }

    const hoveredTarget =
      hovered === undefined
        ? undefined
        : calloutTargetForFeature(hovered.feature);

    // Hovering the selected stop is the same stop twice, not a second card.
    if (hoveredTarget !== undefined && hoveredTarget.id !== selectedStop?.id) {
      targets.push(hoveredTarget);
    }

    return targets;
  }, [hovered, selectedStop]);

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
      const nearest = nearestStop(stationsAt(instance, event.point), [
        event.lngLat.lng,
        event.lngLat.lat,
      ]);
      if (nearest === undefined) return;

      handlers.current.onStationPress(nearest.stopId);
    });

    const untrackPointer = trackStationPointer({
      instance,
      holdMs: theme.durations.xxTiny,
      onStationChange: setHovered,
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

      <MapCallouts map={map} targets={callouts} />
    </>
  );
});
