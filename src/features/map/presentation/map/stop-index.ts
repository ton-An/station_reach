import type { Departure } from '../../domain/models/departure';
import type { Stop } from '../../domain/models/station';

export interface StopEntry {
  readonly stop: Stop;
  readonly departures: readonly Departure[];
}

export type StopIndex = ReadonlyMap<string, StopEntry>;

interface MutableStopEntry {
  stop: Stop;
  departures: Departure[];
}

/**
 * Indexes every reachable stop once, keyed by stop id, so a marker tap is a
 * map lookup instead of a re-scan of every departure.
 *
 * A stop reached by more than one departure keeps the shortest
 * `durationMinutes` seen for it, and collects every departure that reaches
 * it — each counted once even when that departure's own stop list repeats
 * the id.
 *
 * @param departures - The selected station's departures to index.
 * @returns A map from stop id to its shortest-duration {@link Stop} and the
 * departures that reach it.
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
