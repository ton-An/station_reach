import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';
import type { GetStationDepartures } from '../../domain/usecases/get-station-departures';

/**
 * Holds the departures loaded for a station.
 *
 * States:
 * - initial: nothing has been requested
 * - loading: a request is in flight
 * - loaded: the departures for `station` are available
 * - failure: the load failed
 */
export type StationDeparturesState =
  | { readonly status: 'initial' }
  | { readonly status: 'loading' }
  | {
      readonly status: 'loaded';
      readonly station: Station;
      readonly departures: readonly Departure[];
    }
  | { readonly status: 'failure'; readonly failure: Failure };

/**
 * Manages departures for a selected station.
 *
 * Actions:
 * - loadReachability: fetches and loads departures for a station
 */
export interface StationDeparturesStore {
  readonly state: StationDeparturesState;
  readonly loadReachability: (station: Station) => Promise<void>;
}

/**
 * Builds the station departures store.
 *
 * The request id lives in the closure rather than in state, so a superseded
 * load can neither overwrite a newer one nor notify a subscriber.
 *
 * @param getStationDepartures - The use case this store drives.
 */
export function createStationDeparturesStore(
  getStationDepartures: GetStationDepartures
): StoreApi<StationDeparturesStore> {
  let latestRequestId = 0;

  return createStore<StationDeparturesStore>()((set) => ({
    state: { status: 'initial' },

    loadReachability: async (station) => {
      const requestId = ++latestRequestId;

      set({ state: { status: 'loading' } });

      const result = await getStationDepartures(station);

      if (requestId !== latestRequestId) return;

      set({
        state: result.match<StationDeparturesState>(
          (departures) => ({ status: 'loaded', station, departures }),
          (failure) => ({ status: 'failure', failure })
        ),
      });
    },
  }));
}
