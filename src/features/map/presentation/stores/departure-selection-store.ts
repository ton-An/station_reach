import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Departure } from '../../domain/models/departure';

/**
 * Holds the currently selected departure.
 *
 * States:
 * - none: no departure is selected
 * - selected: a departure is selected and available in the state
 */
export type DepartureSelectionState =
  | { readonly status: 'none' }
  | { readonly status: 'selected'; readonly departure: Departure };

/**
 * Manages departure selection.
 *
 * Actions:
 * - select: marks a departure as selected
 * - deselect: clears the selection
 */
export interface DepartureSelectionStore {
  readonly state: DepartureSelectionState;
  readonly select: (departure: Departure) => void;
  readonly deselect: () => void;
}

/**
 * Creates a store for managing departure selection.
 *
 * @returns A Zustand store managing the selected departure.
 */
export function createDepartureSelectionStore(): StoreApi<DepartureSelectionStore> {
  return createStore<DepartureSelectionStore>()((set) => ({
    state: { status: 'none' },

    select: (departure) => set({ state: { status: 'selected', departure } }),

    deselect: () => set({ state: { status: 'none' } }),
  }));
}
