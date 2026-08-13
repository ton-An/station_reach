import { FailureError, noDeparturesFoundFailure } from '@/core/failures';
import { getJson } from '@/core/http/http-client';
import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';
import type { DeparturesQuery } from '../../domain/repositories/map-repository';
import { toDeparture, toStation } from './transitous-mappers';
import { transitModeToWire } from './transitous-modes';
import type { GeocodeStation, StopTimesResponse } from './transitous-types';

const BASE_URL = 'https://api.transitous.org';

/**
 * Fetches stations and departures from the Transitous API.
 *
 * Throws {@link FailureError} on network or API errors.
 */
export interface MapRemoteDataSource {
  /**
   * Searches for stations by name.
   *
   * @param query - The free-text search string.
   * @param signal - Optional abort signal to cancel the request.
   * @returns The matching stations.
   * @throws {@link FailureError} if the request fails.
   */
  searchStations(query: string, signal?: AbortSignal): Promise<Station[]>;

  /**
   * Fetches departures from a station for a single mode bucket.
   *
   * @param query - The {@link DeparturesQuery} specifying the station and
   * modes.
   * @returns The departures for the requested modes.
   * @throws {@link FailureError} if the request fails or if no departures
   * are found.
   */
  getStationDeparturesByMode(query: DeparturesQuery): Promise<Departure[]>;
}

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

  if (response.nextPageCursor === undefined || response.nextPageCursor === '') {
    throw new FailureError(noDeparturesFoundFailure);
  }

  return (response.stopTimes ?? []).map((stopTime) =>
    toDeparture(station, stopTime)
  );
}
