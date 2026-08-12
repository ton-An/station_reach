import { useEffect } from 'react';

import type { Failure } from '@/core/failures';
import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';
import type { StationDeparturesState } from '../../stores/station-departures-store';
import type { StationSearchState } from '../../stores/station-search-store';
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
 */
export function useFailureNotifier(): void {
  const departuresState = useStationDeparturesStore((store) => store.state);
  const searchState = useStationSearchStore((store) => store.state);
  const sendFailure = useInAppNotificationStore((store) => store.sendFailure);

  const failure =
    departuresFailure(departuresState) ?? searchFailure(searchState);

  useEffect(() => {
    if (failure !== undefined) sendFailure(failure);
  }, [failure, sendFailure]);
}

/**
 * What the departures load has to say, which is not only whether it failed.
 *
 * A partial load is still `loaded` — the map is drawn from the bucket that
 * answered — but it is missing a whole class of service, and the user has no
 * way to tell that by looking. Reporting it is the entire point: the old
 * behaviour drew the same incomplete map and said nothing.
 *
 * Takes precedence over a search failure because it is the slower call, so when
 * both are pending it is the one the user is still waiting on.
 */
function departuresFailure(state: StationDeparturesState): Failure | undefined {
  if (state.status === 'failure') return state.failure;
  if (state.status === 'loaded') return state.partialFailure;

  return undefined;
}

function searchFailure(state: StationSearchState): Failure | undefined {
  return state.status === 'failure' ? state.failure : undefined;
}
