import { ResultAsync } from 'neverthrow';

import { FailureError, type Failure } from '@/core/failures';
import { mapHttpError } from '@/core/http/failure-mapper';
import type { MapRepository } from '../../domain/repositories/map-repository';
import type { MapRemoteDataSource } from '../datasources/map-remote-data-source';

/**
 * Wraps the remote data source, turning everything it throws into a value.
 *
 * Nothing above this layer sees an exception.
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

    getStationDeparturesByMode: (station, modes, amount) =>
      ResultAsync.fromPromise(
        dataSource.getStationDeparturesByMode(station, modes, amount),
        toFailure
      ),
  };
}

/** Data-layer failures arrive wrapped; everything else is a transport problem. */
function toFailure(error: unknown): Failure {
  if (error instanceof FailureError) return error.failure;

  return mapHttpError(error);
}
