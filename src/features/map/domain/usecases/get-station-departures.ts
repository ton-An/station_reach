import { err, ok, type Result } from 'neverthrow';

import type { Failure } from '@/core/failures';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- {@link} target
import type { NetworkingFailure } from '@/core/failures/networking-failures';

import type { Departure } from '../models/departure';
import type { Station, Stop } from '../models/station';
import { TransitMode } from '../models/transit-mode';
import type { MapRepository } from '../repositories/map-repository';

const LONG_DISTANCE_MODES = [
  TransitMode.Coach,
  TransitMode.HighspeedRail,
  TransitMode.LongDistance,
  TransitMode.NightRail,
] as const satisfies readonly TransitMode[];

const LONG_DISTANCE_AMOUNT = 1000;

const REGIONAL_MODES = [
  TransitMode.Tram,
  TransitMode.Subway,
  TransitMode.Suburban,
  TransitMode.Bus,
  TransitMode.RegionalFastRail,
  TransitMode.RegionalRail,
  TransitMode.CableCar,
  TransitMode.Funicular,
  TransitMode.AerialLift,
  TransitMode.ArealLift,
  TransitMode.Metro,
] as const satisfies readonly TransitMode[];

const REGIONAL_AMOUNT = 400;

export type GetStationDepartures = (
  station: Station
) => Promise<Result<Departure[], Failure>>;

/**
 * Reads every departure leaving a station.
 *
 * Fetches the long-distance and regional mode buckets concurrently; both
 * are required, so a failure in either fails the whole read. A bucket with
 * nothing scheduled is an answer, not a failure, and contributes no
 * departures.
 *
 * The surviving departures are deduped before sorting, keeping the first
 * occurrence of each unique stop sequence with long distance concatenated
 * first, so a trip published under both buckets keeps its long-distance
 * entry. The result is sorted by name and, within a name, by final-stop
 * duration.
 *
 * @param station - The station to read departures for.
 * @returns The merged departures, or a {@link NetworkingFailure}
 */
export function createGetStationDepartures(
  mapRepository: MapRepository
): GetStationDepartures {
  return async (station) => {
    const [longDistance, regional] = await Promise.all([
      mapRepository.getStationDeparturesByMode({
        station,
        modes: LONG_DISTANCE_MODES,
        amount: LONG_DISTANCE_AMOUNT,
      }),
      mapRepository.getStationDeparturesByMode({
        station,
        modes: REGIONAL_MODES,
        amount: REGIONAL_AMOUNT,
      }),
    ]);

    return mergeDepartures(longDistance, regional);
  };
}

function mergeDepartures(
  longDistance: Result<Departure[], Failure>,
  regional: Result<Departure[], Failure>
): Result<Departure[], Failure> {
  if (longDistance.isErr()) return err(longDistance.error);
  if (regional.isErr()) return err(regional.error);

  return ok(collapse([...longDistance.value, ...regional.value]));
}

function collapse(departures: readonly Departure[]): Departure[] {
  return sortDepartures(dedupeDepartures(departures));
}

function dedupeDepartures(departures: readonly Departure[]): Departure[] {
  const seen = new Set<string>();
  const unique: Departure[] = [];

  for (const departure of departures) {
    const key = stopsKey(departure.stops);
    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(departure);
  }

  return unique;
}

function stopsKey(stops: readonly Stop[]): string {
  return stops
    .map((stop) =>
      [
        stop.id,
        stop.name,
        stop.latitude,
        stop.longitude,
        stop.modes.join(','),
        stop.durationMinutes,
      ].join('|')
    )
    .join(';');
}

function sortDepartures(departures: readonly Departure[]): Departure[] {
  return [...departures].sort((a, b) => {
    if (a.name === b.name) {
      return finalDuration(a) - finalDuration(b);
    }

    return a.name < b.name ? -1 : 1;
  });
}

function finalDuration(departure: Departure): number {
  return departure.stops.at(-1)?.durationMinutes ?? 0;
}
