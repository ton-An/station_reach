import type { Departure } from '../../domain/models/departure';
import type { Stop } from '../../domain/models/station';

/**
 * A reachable stop and the departures that serve it.
 */
export interface StopEntry {
  readonly stop: Stop;
  readonly departures: readonly Departure[];
}

/**
 * Index of reachable stops keyed by stop ID.
 *
 * Tapping a marker is a lookup into this index, so the index must exist
 * before rendering. Each stop is included only once, at its shortest reachable
 * duration.
 */
export type StopIndex = ReadonlyMap<string, StopEntry>;

interface MutableStopEntry {
  stop: Stop;
  departures: Departure[];
}

/**
 * Builds an index of reachable stops from a list of departures.
 *
 * Each stop appears only once in the index, recorded at its shortest reachable
 * duration. Departures are deduplicated per stop: a stop appearing multiple
 * times in one departure is only added to that departure's list once.
 *
 * @param departures - The departures to index.
 * @returns A map of stop ID to stop and its departures.
 */
export function buildStopIndex(departures: readonly Departure[]): StopIndex {
  const index = new Map<string, MutableStopEntry>();

  for (const departure of departures) {
    const seen = new Set<string>();

    for (const stop of departure.stops) {
      const entry = index.get(stop.id);

      if (entry === undefined) {
        index.set(stop.id, { stop, departures: [departure] });
      } else {
        if (stop.durationMinutes < entry.stop.durationMinutes) {
          entry.stop = stop;
        }
        if (!seen.has(stop.id)) entry.departures.push(departure);
      }

      seen.add(stop.id);
    }
  }

  return index;
}
