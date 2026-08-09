import { createContext, useContext, useState } from 'react';

import { createInAppNotificationStore } from '@/core/notifications/in-app-notification-store';
import { createMapRemoteDataSource } from '@/features/map/data/datasources/map-remote-data-source';
import { createMapRepository } from '@/features/map/data/repositories/map-repository-impl';
import { createGetStationDepartures } from '@/features/map/domain/usecases/get-station-departures';
import { createSearchStations } from '@/features/map/domain/usecases/search-stations';
import { createDepartureSelectionStore } from '@/features/map/presentation/stores/departure-selection-store';
import { createStationDeparturesStore } from '@/features/map/presentation/stores/station-departures-store';
import { createStationSearchStore } from '@/features/map/presentation/stores/station-search-store';
import { createStationSelectionStore } from '@/features/map/presentation/stores/station-selection-store';

/**
 * The application's dependency graph.
 *
 * Only the stores are exposed: everything below them is an implementation
 * detail of the layer above, and nothing outside this file should be able to
 * reach a use case, a repository or a data source directly.
 */
export interface Container {
  readonly inAppNotificationStore: ReturnType<
    typeof createInAppNotificationStore
  >;
  readonly stationSearchStore: ReturnType<typeof createStationSearchStore>;
  readonly stationDeparturesStore: ReturnType<
    typeof createStationDeparturesStore
  >;
  readonly stationSelectionStore: ReturnType<
    typeof createStationSelectionStore
  >;
  readonly departureSelectionStore: ReturnType<
    typeof createDepartureSelectionStore
  >;
}

/**
 * Builds the graph.
 *
 * One place to read how the app is wired, in the same order the Flutter
 * `initGetIt()` used. Every dependency is handed to its consumer here —
 * nothing reaches for one at the point of use.
 *
 * Returns:
 * - a fully wired {@link Container}
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
 * a module-level singleton, so the whole app can be rebuilt around a different
 * graph without touching a single component.
 */
export function ContainerProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  // Built once per provider, not once per module, and never during render of
  // a child — so a remount gives a genuinely fresh graph.
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
 * Returns:
 * - the {@link Container} provided above
 */
export function useContainer(): Container {
  const container = useContext(ContainerContext);

  if (container === undefined) {
    throw new Error('useContainer must be used inside a ContainerProvider');
  }

  return container;
}
