import { createStore } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';
import type { GetStationDepartures } from '../../domain/usecases/get-station-departures';

export type StationDeparturesState =
  | { readonly status: 'initial' }
  | { readonly status: 'loading' }
  | {
      readonly status: 'loaded';
      readonly station: Station;
      readonly departures: readonly Departure[];
    }
  | { readonly status: 'failure'; readonly failure: Failure };

export interface StationDeparturesStore {
  readonly state: StationDeparturesState;
  /**
   * Loads everywhere the given station can take you.
   *
   * This is the app's one expensive call — it fans out to two upstream requests
   * and can return thousands of stops.
   */
  readonly loadReachability: (station: Station) => Promise<void>;
}

/**
 * Builds the station departures store.
 *
 * Parameters:
 * - getStationDepartures: the use case this store drives
 */
export function createStationDeparturesStore(
  getStationDepartures: GetStationDepartures
) {
  // Instance state, so a superseded load can never overwrite a newer one.
  let latestRequestId = 0;

  return createStore<StationDeparturesStore>()((set) => ({
    state: { status: 'initial' },

    loadReachability: async (station) => {
      const requestId = ++latestRequestId;

      set({ state: { status: 'loading' } });

      const result = await getStationDepartures(station);

      // The user picked another station while this was loading.
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
