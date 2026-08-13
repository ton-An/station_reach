import { ResultAsync } from 'neverthrow';

import { FailureError, type Failure } from '@/core/failures';
import { mapHttpError } from '@/core/http/failure-mapper';
import type { MapRepository } from '../../domain/repositories/map-repository';
import type { MapRemoteDataSource } from '../datasources/map-remote-data-source';

/** Wraps the remote data source, turning everything it throws into a value. */
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

/** Data-layer failures arrive wrapped; everything else is a transport problem. */
function toFailure(error: unknown): Failure {
  if (error instanceof FailureError) return error.failure;

  return mapHttpError(error);
}
