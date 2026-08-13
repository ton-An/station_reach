import type { Departure } from '../../domain/models/departure';
import type { Station, Stop } from '../../domain/models/station';
import { transitModeFromWire } from './transitous-modes';
import type { GeocodeStation, NextStop, StopTime } from './transitous-types';

const MINUTE_MS = 60_000;

const MAX_ADMIN_LEVEL = 7;

/**
 * Converts a geocode result into a {@link Station}.
 *
 * @param raw - One geocode hit.
 * @returns The station it describes.
 */
export function toStation(raw: GeocodeStation): Station {
  const area = pickAreaName(raw);

  return {
    id: raw.id,
    name: raw.name,
    latitude: raw.lat,
    longitude: raw.lon,
    modes: (raw.modes ?? []).map(transitModeFromWire),
    ...(raw.country === undefined ? {} : { countryCode: raw.country }),
    ...(area === undefined ? {} : { area }),
  };
}

/**
 * Converts a stop time into a {@link Departure}.
 *
 * The origin station is prepended as the first stop at duration zero, so an
 * itinerary always starts where the user is standing.
 *
 * @param origin - The station the departure leaves from.
 * @param raw - The stop time to convert.
 * @returns The departure, with every stop that carries a time.
 */
export function toDeparture(origin: Station, raw: StopTime): Departure {
  const departureTimeMs = new Date(
    raw.place.scheduledDeparture ?? ''
  ).getTime();

  const originStop: Stop = {
    id: origin.id,
    name: origin.name,
    latitude: origin.latitude,
    longitude: origin.longitude,
    modes: origin.modes,
    durationMinutes: 0,
  };

  const stops: Stop[] = [originStop];

  for (const nextStop of raw.nextStops ?? []) {
    const stop = toStop(nextStop, departureTimeMs);
    if (stop !== undefined) stops.push(stop);
  }

  return {
    id: raw.tripId,
    name: departureName(raw),
    mode: transitModeFromWire(raw.mode),
    stops,
  };
}

/**
 * Picks the area name to show beside a station.
 *
 * Prefers the most specific administrative level at or below
 * {@link MAX_ADMIN_LEVEL}, walking down until one matches.
 */
function pickAreaName(raw: GeocodeStation): string | undefined {
  const areas = raw.areas ?? [];

  for (let level = MAX_ADMIN_LEVEL; level >= 0; level--) {
    const match = areas.find((area) => area.adminLevel === level);
    if (match?.name !== undefined) return match.name;
  }

  return undefined;
}

/**
 * Converts a next stop, or returns undefined when it has no time.
 *
 * Stops without a scheduled arrival *or* departure carry no travel time and are
 * dropped.
 */
function toStop(raw: NextStop, departureTimeMs: number): Stop | undefined {
  const arrivalString = raw.scheduledArrival ?? raw.scheduledDeparture;
  if (arrivalString === undefined) return undefined;

  const arrivalMs = new Date(arrivalString).getTime();
  if (Number.isNaN(arrivalMs) || Number.isNaN(departureTimeMs)) {
    return undefined;
  }

  return {
    id: raw.stopId,
    name: raw.name,
    latitude: raw.lat,
    longitude: raw.lon,
    modes: (raw.modes ?? []).map(transitModeFromWire),
    durationMinutes: (arrivalMs - departureTimeMs) / MINUTE_MS,
  };
}

/** Picks the most human name upstream offers for a trip. */
function departureName(raw: StopTime): string {
  return (
    raw.displayName ??
    raw.routeShortName ??
    raw.tripShortName ??
    raw.routeLongName ??
    ''
  );
}
