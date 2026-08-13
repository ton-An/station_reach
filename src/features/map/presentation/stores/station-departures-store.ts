import { createStore, type StoreApi } from 'zustand/vanilla';

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
  readonly loadReachability: (station: Station) => Promise<void>;
}

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
