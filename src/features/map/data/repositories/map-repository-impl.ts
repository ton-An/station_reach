import { ResultAsync } from 'neverthrow';

import { Failure } from '@/core/failures';
import type { MapRepository } from '../../domain/repositories/map-repository';
import type { MapRemoteDataSource } from '../datasources/map-remote-data-source';

export function createMapRepository(
  dataSource: MapRemoteDataSource
): MapRepository {
  return {
    searchStations: (query, signal) =>
      ResultAsync.fromPromise(
        dataSource.searchStations(query, signal),
        relayFailure
      ),

    getStationDeparturesByMode: (query) =>
      ResultAsync.fromPromise(
        dataSource.getStationDeparturesByMode(query),
        relayFailure
      ),
  };
}

function relayFailure(error: unknown): Failure {
  if (error instanceof Failure) return error;
  throw error;
}
