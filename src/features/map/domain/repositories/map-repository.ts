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

export interface MapRepository {
  searchStations(
    query: string,
    signal?: AbortSignal
  ): ResultAsync<Station[], Failure>;

  getStationDeparturesByMode(
    query: DeparturesQuery
  ): ResultAsync<Departure[], Failure>;
}
