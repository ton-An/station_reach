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
   * @param query - The free-text search string.
   * @param signal - Optional abort signal, so a superseded search can be
   * cancelled.
   * @returns The matching stations, or a {@link NetworkingFailure}.
   */
  searchStations(
    query: string,
    signal?: AbortSignal
  ): ResultAsync<Station[], Failure>;

  /**
   * Gets the departures leaving a station, restricted to a set of modes.
   *
   * @returns The departures found, {@link noDeparturesFoundFailure} when the
   * station has none, or a {@link NetworkingFailure}.
   */
  getStationDeparturesByMode(
    query: DeparturesQuery
  ): ResultAsync<Departure[], Failure>;
}
