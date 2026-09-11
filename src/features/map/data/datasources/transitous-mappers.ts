import type { Departure } from '../../domain/models/departure';
import type { Station, Stop } from '../../domain/models/station';
import { transitModeFromTransitous } from './transitous-modes';
import type { GeocodeStation, NextStop, StopTime } from './transitous-types';

const MINUTE_MS = 60_000;

const MAX_ADMIN_LEVEL = 7;

/**
 * Maps a Transitous geocoder result to a {@link Station}.
 *
 * The display area is the `areas[]` entry with the highest `adminLevel` at
 * or below 7, or undefined when none qualifies.
 */
export function toStation(raw: GeocodeStation): Station {
  const area = pickAreaName(raw);

  return {
    id: raw.id,
    name: raw.name,
    latitude: raw.lat,
    longitude: raw.lon,
    modes: (raw.modes ?? []).map(transitModeFromTransitous),
    ...(raw.country === undefined ? {} : { countryCode: raw.country }),
    ...(area === undefined ? {} : { area }),
  };
}

/**
 * Maps one Transitous stop-time to a {@link Departure} reachable from
 * `origin`.
 *
 * `stops` opens with `origin` itself at {@link Stop.durationMinutes} zero,
 * followed by every `raw.nextStops` entry that carries a usable timestamp,
 * each duration measured from `origin`'s scheduled departure. The name
 * falls back through `displayName`, `routeShortName`, `tripShortName` and
 * `routeLongName`, or an empty string when none is set.
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
    mode: transitModeFromTransitous(raw.mode),
    stops,
  };
}

function pickAreaName(raw: GeocodeStation): string | undefined {
  const areas = raw.areas ?? [];

  for (let level = MAX_ADMIN_LEVEL; level >= 0; level--) {
    const match = areas.find((area) => area.adminLevel === level);
    if (match?.name !== undefined) return match.name;
  }

  return undefined;
}

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
    modes: (raw.modes ?? []).map(transitModeFromTransitous),
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
