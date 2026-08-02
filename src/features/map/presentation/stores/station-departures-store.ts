import { create } from 'zustand';

import { container } from '@/core/container';
import type { Failure } from '@/core/failures/failure';
import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';

export type StationDeparturesState =
  | { readonly status: 'initial' }
  | { readonly status: 'loading' }
  | {
      readonly status: 'loaded';
      readonly station: Station;
      readonly departures: readonly Departure[];
    }
  | { readonly status: 'failure'; readonly failure: Failure };

interface StationDeparturesStore {
  readonly state: StationDeparturesState;
  /**
   * Loads everywhere the given station can take you.
   *
   * This is the app's one expensive call — it fans out to two upstream requests
   * and can return thousands of stops.
   */
  readonly loadReachability: (station: Station) => Promise<void>;
}

let latestRequestId = 0;

export const useStationDeparturesStore = create<StationDeparturesStore>()(
  (set) => ({
    state: { status: 'initial' },

    loadReachability: async (station) => {
      const requestId = ++latestRequestId;

      set({ state: { status: 'loading' } });

      const result = await container.getStationDepartures(station);

      // The user picked another station while this was loading.
      if (requestId !== latestRequestId) return;

      set({
        state: result.match<StationDeparturesState>(
          (departures) => ({ status: 'loaded', station, departures }),
          (failure) => ({ status: 'failure', failure })
        ),
      });
    },
  })
);
