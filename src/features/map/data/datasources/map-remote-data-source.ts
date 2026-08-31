import { NoDeparturesFoundFailure } from '@/core/failures';
import { getJson } from '@/core/http/http-client';
import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';
import type { DeparturesQuery } from '../../domain/repositories/map-repository';
import { toDeparture, toStation } from './transitous-mappers';
import { transitModeToWire } from './transitous-modes';
import type { GeocodeStation, StopTimesResponse } from './transitous-types';

const BASE_URL = 'https://api.transitous.org';

/** Reads stations and their departures from the Transitous REST API. */
export interface MapRemoteDataSource {
  /**
   * Searches stations by name, `GET /api/v1/geocode`.
   *
   * @param query - Free text the user typed.
   * @param signal - Aborts the request.
   * @returns The matching stations.
   * @throws a {@link NetworkingFailure}
   */
  searchStations(query: string, signal?: AbortSignal): Promise<Station[]>;

  /**
   * Reads one mode bucket's departures for a station, `GET
   * /api/v6/stoptimes`, a single request with no paging.
   *
   * @param query - The station, the mode bucket and the max departures to
   * request.
   * @returns The departures found.
   * @throws {@link NoDeparturesFoundFailure}
   * when `nextPageCursor` is missing or empty — the station has nothing
   * scheduled for these modes.
   * @throws a {@link NetworkingFailure}
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

  return (response.stopTimes ?? []).map((stopTime) =>
    toDeparture(station, stopTime)
  );
}
