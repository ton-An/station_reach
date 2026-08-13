import { err, ok, ResultAsync, type Result } from 'neverthrow';

import { noDeparturesFoundFailure, type Failure } from '@/core/failures';
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
) => ResultAsync<Departure[], Failure>;

/**
 * Creates the use case that gets everywhere a station can take you.
 *
 * The long-distance and regional buckets are fetched concurrently and merged:
 * - either bucket fails to fetch, so the load fails
 * - both buckets return {@link noDeparturesFoundFailure}, so the load fails
 * - otherwise the two are combined, deduplicated and sorted
 *
 * @param station - The origin station.
 * @returns The departures found, {@link noDeparturesFoundFailure} when
 * neither bucket had any, or a `NetworkingFailure` from whichever bucket
 * failed to fetch.
 */
export function createGetStationDepartures(
  mapRepository: MapRepository
): GetStationDepartures {
  return (station) =>
    ResultAsync.fromSafePromise(
      Promise.all([
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
      ])
    ).andThen(([longDistance, regional]) =>
      mergeDepartures(longDistance, regional)
    );
}

/**
 * Merges two bucket results into a single result.
 *
 * Network errors take precedence and fail the load. If both buckets fail
 * with `noDeparturesFound`, that failure propagates. Otherwise, successful
 * buckets are combined. Results are concatenated with long-distance first.
 */
function mergeDepartures(
  longDistance: Result<Departure[], Failure>,
  regional: Result<Departure[], Failure>
): Result<Departure[], Failure> {
  const fetchFailure = fetchFailureOf(longDistance) ?? fetchFailureOf(regional);
  if (fetchFailure !== undefined) return err(fetchFailure);

  if (longDistance.isErr() && regional.isErr()) {
    return err(noDeparturesFoundFailure);
  }

  return ok(
    collapse([
      ...(longDistance.isOk() ? longDistance.value : []),
      ...(regional.isOk() ? regional.value : []),
    ])
  );
}

/**
 * Extracts a network or API error from a bucket result.
 *
 * Returns the error unless it is `noDeparturesFound`, which is treated as
 * an empty result rather than a failure.
 */
function fetchFailureOf(
  bucket: Result<Departure[], Failure>
): Failure | undefined {
  if (bucket.isOk()) return undefined;

  return bucket.error.code === noDeparturesFoundFailure.code
    ? undefined
    : bucket.error;
}

function collapse(departures: readonly Departure[]): Departure[] {
  return sortDepartures(dedupeDepartures(departures));
}

/**
 * Removes duplicates by stop sequence.
 *
 * Keeps the first occurrence of each unique itinerary (all stops, in order,
 * with same ids, names, coordinates, and durations). Since long-distance
 * departures are concatenated first, a trip published under both names keeps
 * its long-distance one.
 */
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

/** Sorts departures by trip name, then by final-stop duration. */
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
