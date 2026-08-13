import type { Departure } from '../../domain/models/departure';
import type { Station, Stop } from '../../domain/models/station';
import { transitModeFromWire } from './transitous-modes';
import type { GeocodeStation, NextStop, StopTime } from './transitous-types';

const MINUTE_MS = 60_000;

const MAX_ADMIN_LEVEL = 7;

/**
 * Maps a wire {@link GeocodeStation} to a domain {@link Station}.
 *
 * A station's display area is the `areas[]` entry with the highest
 * `adminLevel` ≤ 7.
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
 * Maps a wire {@link StopTime} to a domain {@link Departure}.
 *
 * Calculates travel duration from the origin's scheduled departure time to
 * each subsequent stop's arrival time.
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
 * Picks the most specific geographic area name for a station.
 *
 * Searches from highest to lowest `adminLevel`, up to 7, and returns the
 * name of the first match.
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
 * Converts a wire {@link NextStop} to a domain {@link Stop}.
 *
 * Returns undefined if either the arrival time is missing or the parsed
 * timestamps are invalid.
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

function departureName(raw: StopTime): string {
  return (
    raw.displayName ??
    raw.routeShortName ??
    raw.tripShortName ??
    raw.routeLongName ??
    ''
  );
}
