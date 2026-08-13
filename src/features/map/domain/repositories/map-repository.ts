import type { ResultAsync } from 'neverthrow';

import type { Failure } from '@/core/failures';
import type { Departure } from '../models/departure';
import type { Station } from '../models/station';
import type { TransitMode } from '../models/transit-mode';

export interface DeparturesQuery {
  readonly station: Station;
  readonly modes: readonly TransitMode[];
  readonly amount: number;
}

/**
 * Repository contract for fetching stations and departures.
 *
 * Methods return {@link Failure} on network or API errors. A missing or
 * empty `nextPageCursor` from the API is mapped to {@link noDeparturesFoundFailure}.
 */
export interface MapRepository {
  /**
   * Searches for stations by name.
   *
   * @param query - The free-text search string.
   * @param signal - Optional abort signal to cancel the request.
   * @returns A {@link ResultAsync} with the matching stations or a
   * {@link Failure}.
   */
  searchStations(
    query: string,
    signal?: AbortSignal
  ): ResultAsync<Station[], Failure>;

  /**
   * Fetches departures from a station for a single mode bucket.
   *
   * @param query - The {@link DeparturesQuery} specifying the station and
   * modes.
   * @returns A {@link ResultAsync} with the departures or a
   * {@link noDeparturesFoundFailure}, {@link NetworkingFailure}.
   */
  getStationDeparturesByMode(
    query: DeparturesQuery
  ): ResultAsync<Departure[], Failure>;
}
