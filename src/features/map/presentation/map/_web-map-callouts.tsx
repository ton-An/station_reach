import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl';
import { type RefObject, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { StationCallout } from '../components/station-callout';
import { CALLOUT_ANCHOR, CALLOUT_OFFSET } from './map-config';
import type { StationCalloutTarget } from './station-callout-target';

/** One card for the selected stop, one for the station under the pointer. */
const CALLOUT_SLOTS = 2;

interface MapCalloutsProps {
  /** Read through on each change, so markers are built once it holds one. */
  readonly map: RefObject<MapLibreMap | null>;
  /** The stops to label, in draw order. Extra entries are ignored. */
  readonly targets: readonly StationCalloutTarget[];
}

/**
 * Anchors a `StationCallout` to each target's coordinate, by carrying it in a
 * MapLibre `Marker` and portalling the card into that marker's element.
 *
 * GL JS is imperative, so the card cannot say where it goes. The element is
 * built once and reused, and takes no pointer events: a card that did would
 * end the hover it exists to show.
 */
export function MapCallouts({
  map,
  targets,
}: MapCalloutsProps): React.JSX.Element {
  const [elements] = useState(() =>
    Array.from({ length: CALLOUT_SLOTS }, () => {
      const element = document.createElement('div');
      element.style.pointerEvents = 'none';

      return element;
    })
  );

  useEffect(() => {
    const instance = map.current;
    if (instance === null) return;

    const markers = elements.flatMap((element, index) => {
      const target = targets[index];
      if (target === undefined) return [];

      return [
        new maplibregl.Marker({
          element,
          anchor: CALLOUT_ANCHOR,
          offset: [...CALLOUT_OFFSET],
        })
          .setLngLat([...target.center])
          .addTo(instance),
      ];
    });

    return () => {
      for (const marker of markers) marker.remove();
    };
  }, [map, elements, targets]);

  return (
    <>
      {elements.map((element, index) => {
        const target = targets[index];

        return target === undefined
          ? null
          : createPortal(
              <StationCallout
                name={target.name}
                durationMinutes={target.durationMinutes}
              />,
              element,
              String(index)
            );
      })}
    </>
  );
}
