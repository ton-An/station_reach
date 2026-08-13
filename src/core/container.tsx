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
 * The single dependency graph, built once per app and shared through React
 * context. Holds only Zustand store APIs, reached through {@link useContainer}.
 */
export interface Container {
  readonly inAppNotificationStore: StoreApi<InAppNotificationStore>;
  readonly stationSearchStore: StoreApi<StationSearchStore>;
  readonly stationDeparturesStore: StoreApi<StationDeparturesStore>;
  readonly stationSelectionStore: StoreApi<StationSelectionStore>;
  readonly departureSelectionStore: StoreApi<DepartureSelectionStore>;
}

function createContainer(): Container {
  // -- Data -- //
  const mapRemoteDataSource = createMapRemoteDataSource();
  const mapRepository = createMapRepository(mapRemoteDataSource);

  // -- Domain -- //
  const searchStations = createSearchStations(mapRepository);
  const getStationDepartures = createGetStationDepartures(mapRepository);

  // -- Presentation -- //
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
 * Provides the {@link Container} to the app. Creates the dependency graph
 * once and shares it through React context.
 *
 * @param children - The child components.
 * @returns The provider component.
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
 * Gets the dependency container from context. Throws if called outside a
 * {@link ContainerProvider}.
 *
 * @returns The app's dependency container.
 * @throws Error if not inside a ContainerProvider.
 */
export function useContainer(): Container {
  const container = useContext(ContainerContext);

  if (container === undefined) {
    throw new Error('useContainer must be used inside a ContainerProvider');
  }

  return container;
}
