import { FailureError, noDeparturesFoundFailure } from '@/core/failures';
import { getJson, HttpError } from '@/core/http/http-client';
import type { Departure } from '../../domain/models/departure';
import type { Station, Stop } from '../../domain/models/station';
import {
  transitModeFromWire,
  transitModeToWire,
  type TransitMode,
} from '../../domain/models/transit-mode';
import type {
  GeocodeStation,
  NextStop,
  StopTime,
  StopTimesResponse,
  TransitousErrorBody,
} from './transitous-types';

const BASE_URL = 'https://api.transitous.org';

/** The MOTIS bug we retry around. See {@link getStationDeparturesByMode}. */
const LAST_STOP_ERROR = 'Departure is last stop in trip';

/** How many extra attempts the last-stop workaround may spend. */
const MAX_LAST_STOP_RETRIES = 10;

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** The highest administrative level considered when naming a station's area. */
const MAX_ADMIN_LEVEL = 7;

export interface MapRemoteDataSource {
  searchStations(query: string, signal?: AbortSignal): Promise<Station[]>;
  getStationDeparturesByMode(
    station: Station,
    modes: readonly TransitMode[],
    amount: number
  ): Promise<Departure[]>;
}

/**
 * Talks to the Transitous API.
 *
 * This layer throws — {@link HttpError} for transport problems and
 * {@link FailureError} for data problems. Converting those into values is the
 * repository's job.
 */
export function createMapRemoteDataSource(): MapRemoteDataSource {
  return { searchStations, getStationDeparturesByMode };
}

/**
 * Searches for stations by name.
 *
 * Parameters:
 * - query: the free-text search string
 * - signal: optional abort signal
 *
 * Returns:
 * - the matching stations
 *
 * Throws:
 * - {@link HttpError}
 */
async function searchStations(
  query: string,
  signal?: AbortSignal
): Promise<Station[]> {
  const url = `${BASE_URL}/api/v1/geocode?text=${encodeURIComponent(query)}&type=STOP`;
  const stations = await getJson<readonly GeocodeStation[]>(url, signal);

  return stations.map(toStation);
}

/**
 * Gets the departures leaving a station, restricted to a set of modes.
 *
 * ! This method carries a workaround for a MOTIS bug and the control flow is
 * deliberately awkward. Upstream can answer a perfectly valid request with
 * `{"error": "Departure is last stop in trip"}`. When that happens the only
 * recovery is to ask again for a window an hour later, without a page cursor —
 * up to {@link MAX_LAST_STOP_RETRIES} times. Each such error also buys one more
 * attempt, so a recovered request can still page on afterwards.
 *
 * In the ordinary case exactly one request is made: a response that carries a
 * `nextPageCursor` is accepted as-is, and one that does not means there is
 * genuinely nothing to show.
 *
 * Parameters:
 * - station: the origin station
 * - modes: the modes to include
 * - amount: how many departures to request
 *
 * Returns:
 * - the departures found
 *
 * Throws:
 * - {@link FailureError} wrapping `noDeparturesFoundFailure`
 * - {@link HttpError}
 */
async function getStationDeparturesByMode(
  station: Station,
  modes: readonly TransitMode[],
  amount: number
): Promise<Departure[]> {
  const modeParam = modes.map(transitModeToWire).join(',');
  const now = new Date();
  const nowIso = now.toISOString();

  const baseUrl =
    `${BASE_URL}/api/v6/stoptimes` +
    `?stopId=${encodeURIComponent(station.id)}` +
    `&n=${amount}` +
    `&fetchStops=true` +
    `&realtimeMode=OFF` +
    `&radius=200` +
    `&mode=${encodeURIComponent(modeParam)}` +
    `&withScheduledSkippedStops=false`;

  const stopTimes: StopTime[] = [];

  let nextPageCursor: string | undefined;
  let lastStopTime: Date | undefined;
  let extraAttempts = 0;
  let hadLastStopErrorLastAttempt = false;

  for (let attempt = 0; attempt < 1 + extraAttempts; attempt++) {
    let url = baseUrl;

    if (nextPageCursor !== undefined && nextPageCursor !== '') {
      url += `&pageCursor=${encodeURIComponent(nextPageCursor)}`;
    } else if (attempt > 0 && !hadLastStopErrorLastAttempt) {
      // Nothing left to page through and nothing to retry.
      break;
    }

    url +=
      hadLastStopErrorLastAttempt && lastStopTime !== undefined
        ? `&time=${lastStopTime.toISOString()}`
        : `&time=${nowIso}`;

    try {
      const response = await getJson<StopTimesResponse>(url);

      nextPageCursor = response.nextPageCursor;

      if (nextPageCursor === undefined || nextPageCursor === '') {
        throw new FailureError(noDeparturesFoundFailure);
      }

      const page = response.stopTimes ?? [];
      stopTimes.push(...page);

      const lastScheduledDeparture = page.at(-1)?.place.scheduledDeparture;
      if (lastScheduledDeparture !== undefined) {
        lastStopTime = new Date(lastScheduledDeparture);
      }

      hadLastStopErrorLastAttempt = false;
    } catch (error) {
      if (!isLastStopError(error)) throw error;

      // Shift the query window forward and try again without a cursor.
      if (lastStopTime === undefined) {
        lastStopTime = new Date(now.getTime() + HOUR_MS);
      } else if (hadLastStopErrorLastAttempt) {
        lastStopTime = new Date(lastStopTime.getTime() + HOUR_MS);
      }

      if (extraAttempts < MAX_LAST_STOP_RETRIES) extraAttempts++;

      nextPageCursor = undefined;
      hadLastStopErrorLastAttempt = true;
    }
  }

  return stopTimes.map((stopTime) => toDeparture(station, stopTime));
}

/** Recognises the MOTIS last-stop bug in an error response body. */
function isLastStopError(error: unknown): boolean {
  if (!(error instanceof HttpError)) return false;

  const body = error.body as TransitousErrorBody | undefined;

  return body?.error === LAST_STOP_ERROR;
}

/** Converts a geocode result into a {@link Station}. */
function toStation(raw: GeocodeStation): Station {
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
 * Converts a stop time into a {@link Departure}.
 *
 * The origin station is prepended as the first stop at duration zero, so an
 * itinerary always starts where the user is standing.
 */
function toDeparture(origin: Station, raw: StopTime): Departure {
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
 * Converts a downstream stop, or returns undefined when it has no time.
 *
 * Stops without a scheduled arrival *or* departure carry no travel time, so
 * they cannot be placed on the ramp and are dropped.
 */
function toStop(raw: NextStop, departureTimeMs: number): Stop | undefined {
  const arrivalString = raw.scheduledArrival ?? raw.scheduledDeparture;
  if (arrivalString === undefined) return undefined;

  const arrivalMs = new Date(arrivalString).getTime();
  if (Number.isNaN(arrivalMs) || Number.isNaN(departureTimeMs))
    return undefined;

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
