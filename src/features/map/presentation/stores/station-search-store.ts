import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { Station } from '../../domain/models/station';
import type { SearchStations } from '../../domain/usecases/search-stations';

/**
 * Holds the result of a station search.
 *
 * States:
 * - initial: no search has been performed
 * - loading: a search is in flight, carrying the previous hits so the list
 *   does not blink
 * - loaded: search returned successfully
 * - failure: search failed
 */
export type StationSearchState =
  | { readonly status: 'initial' }
  | { readonly status: 'loading'; readonly stations: readonly Station[] }
  | { readonly status: 'loaded'; readonly stations: readonly Station[] }
  | { readonly status: 'failure'; readonly failure: Failure };

/**
 * Manages station search.
 *
 * Actions:
 * - search: performs a search for stations by query string, cancelling any
 *   previous search in flight
 * - collapse: clears the search results and returns to initial state
 */
export interface StationSearchStore {
  readonly state: StationSearchState;
  readonly search: (query: string) => Promise<void>;
  readonly collapse: () => void;
}

/**
 * The hits worth showing for a state.
 *
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
 * The abort controller and request id live in the closure rather than in
 * state, so a superseded search can neither overwrite a newer one nor notify
 * a subscriber.
 *
 * @param searchStations - The use case this store drives.
 */
export function createStationSearchStore(
  searchStations: SearchStations
): StoreApi<StationSearchStore> {
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
