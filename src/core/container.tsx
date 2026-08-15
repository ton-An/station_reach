import { createContext, useContext, useState } from 'react';
import type { StoreApi } from 'zustand/vanilla';

import {
  createInAppNotificationStore,
  type InAppNotificationStore,
} from '@/core/notifications/in-app-notification-store';
import { createMapRemoteDataSource } from '@/features/map/data/datasources/map-remote-data-source';
import { createMapRepository } from '@/features/map/data/repositories/map-repository-impl';
import { createGetStationDepartures } from '@/features/map/domain/usecases/get-station-departures';
import { createSearchStations } from '@/features/map/domain/usecases/search-stations';
import {
  createDepartureSelectionStore,
  type DepartureSelectionStore,
} from '@/features/map/presentation/stores/departure-selection-store';
import {
  createStationDeparturesStore,
  type StationDeparturesStore,
} from '@/features/map/presentation/stores/station-departures-store';
import {
  createStationSearchStore,
  type StationSearchStore,
} from '@/features/map/presentation/stores/station-search-store';
import {
  createStationSelectionStore,
  type StationSelectionStore,
} from '@/features/map/presentation/stores/station-selection-store';

/**
 * The app's one dependency graph: every store a component can reach through
 * {@link useContainer}. Built once by {@link ContainerProvider}.
 */
export interface Container {
  readonly inAppNotificationStore: StoreApi<InAppNotificationStore>;
  readonly stationSearchStore: StoreApi<StationSearchStore>;
  readonly stationDeparturesStore: StoreApi<StationDeparturesStore>;
  readonly stationSelectionStore: StoreApi<StationSelectionStore>;
  readonly departureSelectionStore: StoreApi<DepartureSelectionStore>;
}

function createContainer(): Container {
  const mapRemoteDataSource = createMapRemoteDataSource();
  const mapRepository = createMapRepository(mapRemoteDataSource);

  const searchStations = createSearchStations(mapRepository);
  const getStationDepartures = createGetStationDepartures(mapRepository);

  return {
    inAppNotificationStore: createInAppNotificationStore(),
    stationSearchStore: createStationSearchStore(searchStations),
    stationDeparturesStore: createStationDeparturesStore(getStationDepartures),
    stationSelectionStore: createStationSelectionStore(),
    departureSelectionStore: createDepartureSelectionStore(),
  };
}

const ContainerContext = createContext<Container | undefined>(undefined);

/**
 * Builds the {@link Container} once per mount and provides it to the
 * component tree below.
 */
export function ContainerProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const [container] = useState(createContainer);

  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  );
}

/**
 * Reads the {@link Container} provided by {@link ContainerProvider}.
 *
 * @throws {Error} Called outside a {@link ContainerProvider}.
 */
export function useContainer(): Container {
  const container = useContext(ContainerContext);

  if (container === undefined) {
    throw new Error('useContainer must be used inside a ContainerProvider');
  }

  return container;
}
