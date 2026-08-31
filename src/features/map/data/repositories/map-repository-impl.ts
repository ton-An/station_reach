import { err, ok, type Result } from 'neverthrow';

import { Failure } from '@/core/failures';

import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';
import type {
  DeparturesQuery,
  MapRepository,
} from '../../domain/repositories/map-repository';
import type { MapRemoteDataSource } from '../datasources/map-remote-data-source';

export function createMapRepository(
  dataSource: MapRemoteDataSource
): MapRepository {
  return {
    searchStations: async (
      query: string,
      signal?: AbortSignal
    ): Promise<Result<Station[], Failure>> => {
      try {
        const stations = await dataSource.searchStations(query, signal);

        return ok(stations);
      } catch (error) {
        if (error instanceof Failure) {
          return err(error);
        }

        throw error;
      }
    },

    getStationDeparturesByMode: async (
      query: DeparturesQuery
    ): Promise<Result<Departure[], Failure>> => {
      try {
        const departures = await dataSource.getStationDeparturesByMode(query);

        return ok(departures);
      } catch (error) {
        if (error instanceof Failure) {
          return err(error);
        }

        throw error;
      }
    },
  };
}
