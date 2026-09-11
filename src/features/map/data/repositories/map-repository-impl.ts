import { err, ok, type Result } from 'neverthrow';

import { Failure } from '@/core/failures';

import type { Departure } from '../../domain/models/departure';
import type { Station } from '../../domain/models/station';
import type {
  DeparturesQuery,
  MapRepository,
} from '../../domain/repositories/map-repository';
import type { MapRemoteDataSource } from '../datasources/map-remote-data-source';

export class MapRepositoryImpl implements MapRepository {
  constructor(private readonly dataSource: MapRemoteDataSource) {}

  async searchStations(
    query: string,
    signal?: AbortSignal
  ): Promise<Result<Station[], Failure>> {
    try {
      const stations = await this.dataSource.searchStations(query, signal);

      return ok(stations);
    } catch (error) {
      if (error instanceof Failure) {
        return err(error);
      }

      throw error;
    }
  }

  async getStationDeparturesByMode(
    query: DeparturesQuery
  ): Promise<Result<Departure[], Failure>> {
    try {
      const departures =
        await this.dataSource.getStationDeparturesByMode(query);

      return ok(departures);
    } catch (error) {
      if (error instanceof Failure) {
        return err(error);
      }

      throw error;
    }
  }
}
