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
 * The application's dependency graph.
 *
 * Only the stores are exposed: everything below them is an implementation
 * detail of the layer above.
 */
export interface Container {
  readonly inAppNotificationStore: StoreApi<InAppNotificationStore>;
  readonly stationSearchStore: StoreApi<StationSearchStore>;
  readonly stationDeparturesStore: StoreApi<StationDeparturesStore>;
  readonly stationSelectionStore: StoreApi<StationSelectionStore>;
  readonly departureSelectionStore: StoreApi<DepartureSelectionStore>;
}

/**
 * Builds the graph.
 *
 * One place to read how the app is wired, in the same order the Flutter
 * `initGetIt()` used. Every dependency is handed to its consumer here —
 * nothing reaches for one at the point of use.
 */
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
 * Provides the graph to the tree below it.
 *
 * Mounted once, at the root. This is what `MultiBlocProvider` did in the
 * Flutter app: components ask the tree for what they need instead of importing
 * a module-level singleton.
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
 * Reads the graph.
 *
 * Intended for the store hooks rather than for components — a component should
 * ask for the state it renders, not for the container.
 *
 * @throws If no {@link ContainerProvider} is mounted above.
 */
export function useContainer(): Container {
  const container = useContext(ContainerContext);

  if (container === undefined) {
    throw new Error('useContainer must be used inside a ContainerProvider');
  }

  return container;
}
