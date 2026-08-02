import { create } from 'zustand';

import type { Departure } from '../../domain/models/departure';

export type DepartureSelectionState =
  | { readonly status: 'none' }
  | { readonly status: 'selected'; readonly departure: Departure };

interface DepartureSelectionStore {
  readonly state: DepartureSelectionState;
  /** Opens a departure's full itinerary. */
  readonly select: (departure: Departure) => void;
  /** Returns to the departure list. */
  readonly deselect: () => void;
}

export const useDepartureSelectionStore = create<DepartureSelectionStore>()(
  (set) => ({
    state: { status: 'none' },

    select: (departure) => set({ state: { status: 'selected', departure } }),

    deselect: () => set({ state: { status: 'none' } }),
  })
);
