import { useStore } from 'zustand';

import { useContainer } from '@/core/container';
import type { DepartureSelectionStore } from './departure-selection-store';
import type { StationDeparturesStore } from './station-departures-store';
import type { StationSearchStore } from './station-search-store';
import type { StationSelectionStore } from './station-selection-store';

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
