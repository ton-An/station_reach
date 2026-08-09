import { useStore } from 'zustand';

import { useContainer } from '@/core/container';
import type { DepartureSelectionStore } from './departure-selection-store';
import type { StationDeparturesStore } from './station-departures-store';
import type { StationSearchStore } from './station-search-store';
import type { StationSelectionStore } from './station-selection-store';

/*
  The map feature's stores, as hooks.

  Each one resolves its store from the container in the tree rather than from a
  module-level singleton, which is what keeps the injection honest. They live
  here, apart from the stores themselves, so that a store never has to import
  the container that constructs it.
*/

/** Subscribes to the station search store. */
export function useStationSearchStore<T>(
  selector: (store: StationSearchStore) => T
): T {
  return useStore(useContainer().stationSearchStore, selector);
}

/** Subscribes to the station departures store. */
export function useStationDeparturesStore<T>(
  selector: (store: StationDeparturesStore) => T
): T {
  return useStore(useContainer().stationDeparturesStore, selector);
}

/** Subscribes to the station selection store. */
export function useStationSelectionStore<T>(
  selector: (store: StationSelectionStore) => T
): T {
  return useStore(useContainer().stationSelectionStore, selector);
}

/** Subscribes to the departure selection store. */
export function useDepartureSelectionStore<T>(
  selector: (store: DepartureSelectionStore) => T
): T {
  return useStore(useContainer().departureSelectionStore, selector);
}
