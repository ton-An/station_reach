import { useEffect } from 'react';

import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';
import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../stores/use-map-stores';

/**
 * Forwards whatever failed on this screen to the global notification.
 *
 * The one place the map feature's failures become visible. Both stores hold
 * their failure in state rather than announcing it, so somebody has to watch
 * them — and it is a screen-level job precisely because no single component
 * should decide how the app reports an error.
 *
 * A departures failure wins over a search failure: it is the slower call, so
 * when both are pending it is the one the user is still waiting on.
 */
export function useFailureNotifier(): void {
  const departuresState = useStationDeparturesStore((store) => store.state);
  const searchState = useStationSearchStore((store) => store.state);
  const sendFailure = useInAppNotificationStore((store) => store.sendFailure);

  const failure =
    departuresState.status === 'failure'
      ? departuresState.failure
      : searchState.status === 'failure'
        ? searchState.failure
        : undefined;

  useEffect(() => {
    if (failure !== undefined) sendFailure(failure);
  }, [failure, sendFailure]);
}
