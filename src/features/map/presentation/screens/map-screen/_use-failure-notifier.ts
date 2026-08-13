import { useEffect } from 'react';

import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';
import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../stores/use-map-stores';

/**
 * Watches for failures in search or departures and sends them to the in-app
 * notification store to be displayed to the user.
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
