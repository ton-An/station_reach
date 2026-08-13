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
 * A departures failure wins over a search failure, and a failure state persists
 * until its store starts another call, so a failed reachability load hides
 * every search failure until the user picks a station again.
 */
export function useFailureNotifier(): void {
  const departuresState = useStationDeparturesStore((store) => store.state);
  const searchState = useStationSearchStore((store) => store.state);
  const sendFailure = useInAppNotificationStore((store) => store.sendFailure);

  // The state object, not the failure inside it: failures are module-level
  // constants, so a repeat of the same one is the same reference and would
  // never re-fire the effect. Both stores build a new state on every `set`.
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
