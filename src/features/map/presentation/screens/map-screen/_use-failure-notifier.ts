import { useEffect } from 'react';

import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';

import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../stores/use-map-stores';

/**
 * Forwards station-departures and station-search failures to the global
 * in-app notification store. A departures failure takes priority when both
 * stores are failing at once.
 *
 * The map screen renders no error banners of its own; every failure surfaces
 * through {@link useInAppNotificationStore} instead.
 */
export function useFailureNotifier(): void {
  const departuresState = useStationDeparturesStore((store) => store.state);
  const searchState = useStationSearchStore((store) => store.state);
  const sendFailure = useInAppNotificationStore((store) => store.sendFailure);

  const failureState =
    departuresState.status === 'failure'
      ? departuresState
      : searchState.status === 'failure'
        ? searchState
        : undefined;

  useEffect(() => {
    if (failureState !== undefined) sendFailure(failureState.failure);
  }, [failureState, sendFailure]);
}
