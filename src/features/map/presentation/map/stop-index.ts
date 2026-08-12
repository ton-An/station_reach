import type { Departure } from '../../domain/models/departure';
import type { Stop } from '../../domain/models/station';

/** Everything the map needs to know about one reachable stop. */
export interface StopEntry {
  /** The fastest arrival at this stop across every departure. */
  readonly stop: Stop;
  /** The departures that call here, in load order. */
  readonly departures: readonly Departure[];
}

/** Reachable stops by id. */
export type StopIndex = ReadonlyMap<string, StopEntry>;

/** The mutable shape the index is assembled through. */
interface MutableStopEntry {
  stop: Stop;
  departures: Departure[];
}

/**
 * Indexes the loaded departures by the stops they call at.
 *
 * Built once per reachability set so that tapping a station is a lookup rather
 * than a scan: the naive version walked every departure's every stop twice on
 * each tap, which is tens of thousands of comparisons before anything paints.
 *
 * Parameters:
 * - departures: every departure loaded for the origin station
 *
 * Returns:
 * - one entry per reachable stop, holding its fastest arrival and its trips
 */
export function buildStopIndex(departures: readonly Departure[]): StopIndex {
  const index = new Map<string, MutableStopEntry>();

  for (const departure of departures) {
    // A circular route calls at the same stop twice and must still be listed
    // against it once.
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
