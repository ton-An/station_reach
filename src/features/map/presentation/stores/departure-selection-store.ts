import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Departure } from '../../domain/models/departure';

export type DepartureSelectionState =
  | { readonly status: 'none' }
  | { readonly status: 'selected'; readonly departure: Departure };

export interface DepartureSelectionStore {
  readonly state: DepartureSelectionState;
  /** Opens a departure's full itinerary. */
  readonly select: (departure: Departure) => void;
  /** Returns to the departure list. */
  readonly deselect: () => void;
}

/** Builds the departure selection store. It has no dependencies of its own. */
export function createDepartureSelectionStore(): StoreApi<DepartureSelectionStore> {
  return createStore<DepartureSelectionStore>()((set) => ({
    state: { status: 'none' },

    select: (departure) => set({ state: { status: 'selected', departure } }),

    deselect: () => set({ state: { status: 'none' } }),
  }));
}
