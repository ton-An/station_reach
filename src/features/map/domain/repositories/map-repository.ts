import type { ResultAsync } from 'neverthrow';

import type { Failure } from '@/core/failures';
import type { Departure } from '../models/departure';
import type { Station } from '../models/station';
import type { TransitMode } from '../models/transit-mode';

/** One departures request, narrowed to a single bucket of transit modes. */
export interface DeparturesQuery {
  readonly station: Station;
  readonly modes: readonly TransitMode[];
  /** Upper bound on how many departures the answer may contain. */
  readonly amount: number;
}

/** Reads stations and their departures. */
export interface MapRepository {
  /**
   * Searches stations by name.
   *
   * @param query - Free text the user typed.
   * @param signal - Aborts the search.
   * @returns The matching stations, or one of {@link receiveTimeoutFailure},
   * {@link requestCancelledFailure}, {@link connectionFailure},
   * {@link statusCodeNotOkFailure}, {@link badResponseFailure} and
   * {@link unknownRequestFailure}.
   */
  searchStations(
    query: string,
    signal?: AbortSignal
  ): ResultAsync<Station[], Failure>;

  /**
   * Reads the departures leaving a station, each carrying every stop it
   * reaches and how long it takes to get there.
   *
   * @returns The departures found, {@link noDeparturesFoundFailure} when the
   * station has none scheduled, or one of {@link receiveTimeoutFailure},
   * {@link requestCancelledFailure}, {@link connectionFailure},
   * {@link statusCodeNotOkFailure}, {@link badResponseFailure} and
   * {@link unknownRequestFailure}.
   */
  getStationDeparturesByMode(
    query: DeparturesQuery
  ): ResultAsync<Departure[], Failure>;
}
