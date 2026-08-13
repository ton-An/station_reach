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

export function createDepartureSelectionStore(): StoreApi<DepartureSelectionStore> {
  return createStore<DepartureSelectionStore>()((set) => ({
    state: { status: 'none' },

    select: (departure) => set({ state: { status: 'selected', departure } }),

    deselect: () => set({ state: { status: 'none' } }),
  }));
}
