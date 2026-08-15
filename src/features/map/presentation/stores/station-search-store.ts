import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { Station } from '../../domain/models/station';
import type { SearchStations } from '../../domain/usecases/search-stations';

export type StationSearchState =
  | { readonly status: 'initial' }
  | { readonly status: 'loading'; readonly stations: readonly Station[] }
  | { readonly status: 'loaded'; readonly stations: readonly Station[] }
  | { readonly status: 'failure'; readonly failure: Failure };

export interface StationSearchStore {
  readonly state: StationSearchState;
  readonly search: (query: string) => Promise<void>;
  readonly collapse: () => void;
}

/** The stations to render, empty while there is nothing to show. */
export function visibleStations(state: StationSearchState): readonly Station[] {
  return state.status === 'loading' || state.status === 'loaded'
    ? state.stations
    : [];
}

/**
 * Searches stations for the query the user is typing.
 *
 * A new search aborts the one in flight, and a late answer whose request is no
 * longer the newest is dropped. Results already on screen stay visible while
 * the next search runs. An empty query needs no request and resets to
 * `initial`, as does {@link StationSearchStore.collapse}.
 *
 * States:
 * - `initial`: nothing searched
 * - `loading`: a search is running, over the previous results
 * - `loaded`: the stations the newest search found
 * - `failure`: the newest search failed
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
