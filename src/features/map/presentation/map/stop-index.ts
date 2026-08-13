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
