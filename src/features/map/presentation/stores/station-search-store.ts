import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { Station } from '../../domain/models/station';
import type { SearchStations } from '../../domain/usecases/search-stations';

export type StationSearchState =
  | { readonly status: 'initial' }
  /** Results are in flight. Carries the previous hits so the list doesn't blink. */
  | { readonly status: 'loading'; readonly stations: readonly Station[] }
  | { readonly status: 'loaded'; readonly stations: readonly Station[] }
  | { readonly status: 'failure'; readonly failure: Failure };

export interface StationSearchStore {
  readonly state: StationSearchState;
  /**
   * Searches for stations.
   *
   * Supersedes any in-flight search: the previous request is aborted and a late
   * response from it is ignored, so results can never arrive out of order.
   * An empty query collapses the list rather than searching for nothing.
   */
  readonly search: (query: string) => Promise<void>;
  /** Hides the results, e.g. once the user has picked a station. */
  readonly collapse: () => void;
}

/**
 * The hits worth showing for a state.
 *
 * @param state - The state to read.
 * @returns The stations, or none outside the loading and loaded states.
 */
export function visibleStations(state: StationSearchState): readonly Station[] {
  return state.status === 'loading' || state.status === 'loaded'
    ? state.stations
    : [];
}

/**
 * Builds the station search store.
 *
 * @param searchStations - The use case this store drives.
 * @returns The store.
 */
export function createStationSearchStore(
  searchStations: SearchStations
): StoreApi<StationSearchStore> {
  // Instance state, so a superseded search can never overwrite a newer one.
  let inFlight: AbortController | undefined;
  let latestRequestId = 0;

  return createStore<StationSearchStore>()((set, get) => ({
    state: { status: 'initial' },

    search: async (query) => {
      inFlight?.abort();

      if (query.trim() === '') {
        inFlight = undefined;
        latestRequestId++;
        set({ state: { status: 'initial' } });
        return;
      }

      const controller = new AbortController();
      inFlight = controller;
      const requestId = ++latestRequestId;

      set({
        state: { status: 'loading', stations: visibleStations(get().state) },
      });

      const result = await searchStations(query, controller.signal);

      // A newer search started while this one was in flight.
      if (requestId !== latestRequestId) return;

      inFlight = undefined;

      set({
        state: result.match<StationSearchState>(
          (stations) => ({ status: 'loaded', stations }),
          (failure) => ({ status: 'failure', failure })
        ),
      });
    },

    collapse: () => {
      inFlight?.abort();
      inFlight = undefined;
      latestRequestId++;
      set({ state: { status: 'initial' } });
    },
  }));
}
