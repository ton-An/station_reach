import { err, ok, ResultAsync, type Result } from 'neverthrow';

import { noDeparturesFoundFailure, type Failure } from '@/core/failures';
import type { Departure } from '../models/departure';
import type { Station, Stop } from '../models/station';
import { TransitMode } from '../models/transit-mode';
import type { MapRepository } from '../repositories/map-repository';

/**
 * Long-distance services, requested in bulk.
 *
 * These trips have few stops but reach far, so a high `n` is cheap and buys a
 * much larger reachable area.
 */
const LONG_DISTANCE_MODES: readonly TransitMode[] = [
  TransitMode.Coach,
  TransitMode.HighspeedRail,
  TransitMode.LongDistance,
  TransitMode.NightRail,
];

const LONG_DISTANCE_AMOUNT = 1000;

/** Everything local. Dense and stop-heavy, so a smaller `n` keeps it fast. */
const REGIONAL_MODES: readonly TransitMode[] = [
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
];

const REGIONAL_AMOUNT = 400;

export type GetStationDepartures = (
  station: Station
) => ResultAsync<Departure[], Failure>;

/**
 * Gets everywhere a station can take you.
 *
 * Long-distance and regional departures are fetched as two independent requests
 * and merged. If only one bucket comes back empty the other is still used —
 * plenty of stations serve exactly one kind of service.
 *
 * Parameters:
 * - station: the origin station
 *
 * Returns:
 * - the deduplicated departures, sorted by name and then travel time
 *
 * Failures:
 * - noDeparturesFoundFailure
 * - any networking failure
 */
export function createGetStationDepartures(
  mapRepository: MapRepository
): GetStationDepartures {
  return (station) =>
    ResultAsync.fromSafePromise(
      // Independent requests — run them together rather than back to back.
      Promise.all([
        mapRepository.getStationDeparturesByMode(
          station,
          LONG_DISTANCE_MODES,
          LONG_DISTANCE_AMOUNT
        ),
        mapRepository.getStationDeparturesByMode(
          station,
          REGIONAL_MODES,
          REGIONAL_AMOUNT
        ),
      ])
    ).andThen(([longDistance, regional]) =>
      mergeDepartures(longDistance, regional)
    );
}

/**
 * Combines the two mode buckets.
 *
 * A bucket that simply had nothing to offer is not an error; a bucket that
 * failed for any other reason is.
 */
function mergeDepartures(
  longDistance: Result<Departure[], Failure>,
  regional: Result<Departure[], Failure>
): Result<Departure[], Failure> {
  if (longDistance.isErr()) {
    if (longDistance.error.code !== noDeparturesFoundFailure.code) {
      return err(longDistance.error);
    }

    // Long distance had nothing — regional alone still makes a useful map.
    return regional.map(collapse);
  }

  if (regional.isErr()) {
    return ok(collapse(longDistance.value));
  }

  return ok(collapse([...longDistance.value, ...regional.value]));
}

/**
 * Deduplicate, then sort — in that order.
 *
 * Dedupe keeps the first occurrence, and long-distance departures are
 * concatenated first, so a trip published under both a long-distance and a
 * regional name keeps its long-distance name. Sorting first would silently
 * hand that choice to alphabetical order instead.
 */
function collapse(departures: readonly Departure[]): Departure[] {
  return sortDepartures(dedupeDepartures(departures));
}

/**
 * Drops departures that visit exactly the same stops at the same times.
 *
 * Operators frequently publish one trip under several route names; without this
 * the map draws the same line several times over.
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

/**
 * A stable identity for a stop list, used to detect duplicate trips.
 *
 * Position, name and timing only — `countryCode` and `area` are never set on a
 * stop, and two trips that agree on everything here are the same line drawn
 * twice whatever else they might carry.
 */
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

/**
 * Sorts by route name, then by how far the trip goes.
 *
 * Ordinal comparison, matching Dart's `String.compareTo` — a locale-aware
 * collation would reorder the list between platforms.
 */
function sortDepartures(departures: readonly Departure[]): Departure[] {
  return [...departures].sort((a, b) => {
    if (a.name === b.name) {
      return finalDuration(a) - finalDuration(b);
    }

    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
}

/** The travel time to the last stop, i.e. how far this trip reaches. */
function finalDuration(departure: Departure): number {
  return departure.stops.at(-1)?.durationMinutes ?? 0;
}
