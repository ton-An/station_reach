import { ResultAsync } from 'neverthrow';

import { FailureError, type Failure } from '@/core/failures';
import { mapHttpError } from '@/core/http/failure-mapper';
import type { MapRepository } from '../../domain/repositories/map-repository';
import type { MapRemoteDataSource } from '../datasources/map-remote-data-source';

/**
 * Creates a map repository that wraps a data source and converts thrown
 * exceptions to {@link Failure} results.
 */
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
  if (error instanceof FailureError) return error.failure;

  return mapHttpError(error);
}
