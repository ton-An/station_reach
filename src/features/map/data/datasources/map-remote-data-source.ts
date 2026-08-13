import { FailureError, noDeparturesFoundFailure } from '@/core/failures';
import { getJson } from '@/core/http/http-client';
import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';
import type { DeparturesQuery } from '../../domain/repositories/map-repository';
import { toDeparture, toStation } from './transitous-mappers';
import { transitModeToWire } from './transitous-modes';
import type { GeocodeStation, StopTimesResponse } from './transitous-types';

const BASE_URL = 'https://api.transitous.org';

export interface MapRemoteDataSource {
  /**
   * Searches for stations by name.
   *
   * @param query - The free-text search string.
   * @param signal - Optional abort signal, so a superseded search can be
   * cancelled.
   * @returns The matching stations.
   * @throws `HttpError`.
   */
  searchStations(query: string, signal?: AbortSignal): Promise<Station[]>;

  /**
   * Gets the departures leaving a station, restricted to a set of modes.
   *
   * One request. `amount` is large enough to cover a station's whole departure
   * board in a single page, so there is nothing to page through — the cursor is
   * only read to tell an empty board apart from a full one.
   *
   * @returns The departures found.
   * @throws {@link FailureError} wrapping {@link noDeparturesFoundFailure}, or
   * `HttpError`.
   */
  getStationDeparturesByMode(query: DeparturesQuery): Promise<Departure[]>;
}

/** Talks to the Transitous API. */
export function createMapRemoteDataSource(): MapRemoteDataSource {
  return { searchStations, getStationDeparturesByMode };
}

async function searchStations(
  query: string,
  signal?: AbortSignal
): Promise<Station[]> {
  const url = `${BASE_URL}/api/v1/geocode?text=${encodeURIComponent(query)}&type=STOP`;
  const stations = await getJson<readonly GeocodeStation[]>(url, signal);

  return stations.map(toStation);
}

async function getStationDeparturesByMode({
  station,
  modes,
  amount,
}: DeparturesQuery): Promise<Departure[]> {
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
