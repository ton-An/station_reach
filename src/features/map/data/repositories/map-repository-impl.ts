import { ResultAsync } from 'neverthrow';

import { Failure, UnknownRequestFailure } from '@/core/failures';
import type { MapRepository } from '../../domain/repositories/map-repository';
import type { MapRemoteDataSource } from '../datasources/map-remote-data-source';

export function createMapRepository(
  dataSource: MapRemoteDataSource
): MapRepository {
  return {
    searchStations: (query, signal) =>
      ResultAsync.fromPromise(
        dataSource.searchStations(query, signal),
        toFailure
      ),

    getStationDeparturesByMode: (query) =>
      ResultAsync.fromPromise(
        dataSource.getStationDeparturesByMode(query),
        toFailure
      ),
  };
}

function toFailure(error: unknown): Failure {
  return error instanceof Failure
    ? error
    : new UnknownRequestFailure({ cause: error });
}
