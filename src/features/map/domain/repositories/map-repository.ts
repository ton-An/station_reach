import type { Result } from 'neverthrow';

import type { Failure } from '@/core/failures';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- {@link} target
import type { NetworkingFailure } from '@/core/failures/networking-failures';

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
   * @returns The matching stations, or a {@link NetworkingFailure}
   */
  searchStations(
    query: string,
    signal?: AbortSignal
  ): Promise<Result<Station[], Failure>>;

  /**
   * Reads the departures leaving a station, each carrying every stop it
   * reaches and how long it takes to get there.
   *
   * @returns The departures found, empty when the station has nothing
   * scheduled for these modes, or a {@link NetworkingFailure}
   */
  getStationDeparturesByMode(
    query: DeparturesQuery
  ): Promise<Result<Departure[], Failure>>;
}
