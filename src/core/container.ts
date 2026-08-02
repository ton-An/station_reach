import { createMapRemoteDataSource } from '@/features/map/data/datasources/map-remote-data-source';
import { createMapRepository } from '@/features/map/data/repositories/map-repository-impl';
import {
  createGetStationDepartures,
  type GetStationDepartures,
} from '@/features/map/domain/usecases/get-station-departures';
import {
  createSearchStations,
  type SearchStations,
} from '@/features/map/domain/usecases/search-stations';

/**
 * The application's dependency graph.
 *
 * Everything is constructed here and passed downward — nothing reaches for a
 * dependency at the point of use. One place to read how the app is wired, in
 * the same order the Flutter `initGetIt()` used.
 */
export interface Container {
  readonly searchStations: SearchStations;
  readonly getStationDepartures: GetStationDepartures;
}

function build(): Container {
  // -- Data -- //
  const mapRemoteDataSource = createMapRemoteDataSource();
  const mapRepository = createMapRepository(mapRemoteDataSource);

  // -- Domain -- //
  const searchStations = createSearchStations(mapRepository);
  const getStationDepartures = createGetStationDepartures(mapRepository);

  return { searchStations, getStationDepartures };
}

export const container: Container = build();
