import { FailureError, noDeparturesFoundFailure } from '@/core/failures';
import { getJson } from '@/core/http/http-client';
import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';
import {
  transitModeToWire,
  type TransitMode,
} from '../../domain/models/transit-mode';
import { toDeparture, toStation } from './transitous-mappers';
import type { GeocodeStation, StopTimesResponse } from './transitous-types';

const BASE_URL = 'https://api.transitous.org';

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
 * This layer throws — `HttpError` for transport problems and
 * {@link FailureError} for data problems. Converting those into values is the
 * repository's job. Turning wire shapes into domain models is
 * `transitous-mappers`'.
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
 * - `HttpError`
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
 * One request. `amount` is large enough to cover a station's whole departure
 * board in a single page, so there is nothing to page through — the cursor is
 * only read to tell an empty board apart from a full one.
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
 * - `HttpError`
 */
async function getStationDeparturesByMode(
  station: Station,
  modes: readonly TransitMode[],
  amount: number
): Promise<Departure[]> {
  const modeParam = modes.map(transitModeToWire).join(',');

  const url =
    `${BASE_URL}/api/v6/stoptimes` +
    `?stopId=${encodeURIComponent(station.id)}` +
    `&n=${amount}` +
    `&fetchStops=true` +
    `&realtimeMode=OFF` +
    `&radius=200` +
    `&mode=${encodeURIComponent(modeParam)}` +
    `&withScheduledSkippedStops=false` +
    `&time=${new Date().toISOString()}`;

  const response = await getJson<StopTimesResponse>(url);

  // Upstream answers a station it has nothing for with no cursor at all.
  if (response.nextPageCursor === undefined || response.nextPageCursor === '') {
    throw new FailureError(noDeparturesFoundFailure);
  }

  return (response.stopTimes ?? []).map((stopTime) =>
    toDeparture(station, stopTime)
  );
}
