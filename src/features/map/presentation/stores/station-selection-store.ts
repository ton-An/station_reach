import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Departure } from '../../domain/models/departure';
import type { Stop } from '../../domain/models/station';

export type StationSelectionState =
  | { readonly status: 'unselected' }
  | {
      readonly status: 'selected';
      readonly selectedStop: Stop;
      readonly departures: readonly Departure[];
    };

export interface StationSelectionStore {
  readonly state: StationSelectionState;
  readonly select: (
    selectedStop: Stop,
    departures: readonly Departure[]
  ) => void;
  readonly unselect: () => void;
}

/**
 * Tracks which stop is selected on the map, and the departures reaching it.
 *
 * `select` is a no-op when the given stop is already selected, and
 * `unselect` is a no-op when nothing is selected, so neither replaces state
 * with an equal value.
 *
 * States:
 * - `unselected`: no stop selected
 * - `selected`: the selected stop and the departures reaching it
 */
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
