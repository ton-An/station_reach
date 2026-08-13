import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Departure } from '../../domain/models/departure';
import type { Stop } from '../../domain/models/station';

/**
 * Holds a selected stop and its departures.
 *
 * States:
 * - unselected: no stop is selected
 * - selected: a stop and its departures are selected
 */
export type StationSelectionState =
  | { readonly status: 'unselected' }
  | {
      readonly status: 'selected';
      readonly selectedStop: Stop;
      readonly departures: readonly Departure[];
    };

/**
 * Manages stop selection and its departures.
 *
 * Actions:
 * - select: selects a stop and the departures calling at it, and does nothing
 *   when that stop is already selected
 * - unselect: clears the selection
 */
export interface StationSelectionStore {
  readonly state: StationSelectionState;
  readonly select: (
    selectedStop: Stop,
    departures: readonly Departure[]
  ) => void;
  readonly unselect: () => void;
}

/** Builds the station selection store. */
export function createStationSelectionStore(): StoreApi<StationSelectionStore> {
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
