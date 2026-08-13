import type { ResultAsync } from 'neverthrow';

import type { Failure } from '@/core/failures';
import type { Departure } from '../models/departure';
import type { Station } from '../models/station';
import type { TransitMode } from '../models/transit-mode';

/** The arguments of a departures request. */
export interface DeparturesQuery {
  readonly station: Station;
  readonly modes: readonly TransitMode[];
  /** How many departures to request. */
  readonly amount: number;
}

export interface MapRepository {
  /**
   * Searches for stations by name.
   *
   * Parameters:
   * - query: the free-text search string
   * - signal: optional abort signal, so a superseded search can be cancelled
   *
   * Returns:
   * - the matching stations
   *
   * Failures:
   * - any networking failure
   */
  searchStations(
    query: string,
    signal?: AbortSignal
  ): ResultAsync<Station[], Failure>;

  /**
   * Gets the departures leaving a station, restricted to a set of modes.
   *
   * Parameters:
   * - station: the origin station
   * - modes: the modes to include
   * - amount: how many departures to request
   *
   * Returns:
   * - the departures found
   *
   * Failures:
   * - noDeparturesFoundFailure
   * - any networking failure
   */
  getStationDeparturesByMode(
    query: DeparturesQuery
  ): ResultAsync<Departure[], Failure>;
}
