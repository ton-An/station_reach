import { create } from 'zustand';

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

interface StationSelectionStore {
  readonly state: StationSelectionState;
  /**
   * Selects a stop on the map and narrows the departure list to it.
   *
   * Parameters:
   * - selectedStop: the stop the user tapped
   * - departures: every departure currently loaded
   */
  readonly select: (
    selectedStop: Stop,
    departures: readonly Departure[]
  ) => void;
  readonly unselect: () => void;
}

export const useStationSelectionStore = create<StationSelectionStore>()(
  (set) => ({
    state: { status: 'unselected' },

    select: (selectedStop, departures) => {
      // `some`, not a nested loop: a circular route calls at the same stop
      // twice and must still appear once.
      const calling = departures.filter((departure) =>
        departure.stops.some((stop) => stop.id === selectedStop.id)
      );

      set({ state: { status: 'selected', selectedStop, departures: calling } });
    },

    unselect: () => set({ state: { status: 'unselected' } }),
  })
);
