import { createStore } from 'zustand/vanilla';

import type { Departure } from '../../domain/models/departure';
import type { Stop } from '../../domain/models/station';

export type StationSelectionState =
  | { readonly status: 'unselected' }
  | {
      readonly status: 'selected';
      readonly selectedStop: Stop;
      /** Only the departures that actually call at the selected stop. */
      readonly departures: readonly Departure[];
    };

export interface StationSelectionStore {
  readonly state: StationSelectionState;
  /**
   * Selects a stop on the map.
   *
   * The caller passes the trips already narrowed to this stop — they come out
   * of the map's stop index, which resolved them when the reachability set
   * loaded, so a tap never rescans every departure.
   *
   * Re-selecting what is already selected does nothing, which is what lets the
   * map answer one tap through two paths without redrawing twice.
   *
   * Parameters:
   * - selectedStop: the stop the user tapped
   * - departures: the departures calling at that stop
   */
  readonly select: (
    selectedStop: Stop,
    departures: readonly Departure[]
  ) => void;
  readonly unselect: () => void;
}

/** Builds the station selection store. It has no dependencies of its own. */
export function createStationSelectionStore() {
  return createStore<StationSelectionStore>()((set, get) => ({
    state: { status: 'unselected' },

    select: (selectedStop, departures) => {
      const { state } = get();
      if (
        state.status === 'selected' &&
        state.selectedStop.id === selectedStop.id
      ) {
        return;
      }

      set({ state: { status: 'selected', selectedStop, departures } });
    },

    unselect: () => {
      if (get().state.status === 'unselected') return;
      set({ state: { status: 'unselected' } });
    },
  }));
}
