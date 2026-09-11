import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Departure } from '../../domain/models/departure';

export type DepartureSelectionState =
  | { readonly status: 'none' }
  | { readonly status: 'selected'; readonly departure: Departure };

export interface DepartureSelectionStore {
  readonly state: DepartureSelectionState;
  readonly select: (departure: Departure) => void;
  readonly deselect: () => void;
}

/**
 * Tracks which departure the user opened for detail.
 *
 * `deselect` is a no-op when nothing is selected, so it never replaces state
 * with an equal value.
 *
 * States:
 * - `none`: no departure selected
 * - `selected`: the departure open for detail
 */
export function createDepartureSelectionStore(): StoreApi<DepartureSelectionStore> {
  return createStore<DepartureSelectionStore>()((set, get) => ({
    state: { status: 'none' },

    select: (departure) => set({ state: { status: 'selected', departure } }),

    deselect: () => {
      if (get().state.status === 'none') return;
      set({ state: { status: 'none' } });
    },
  }));
}
