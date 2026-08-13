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
