import { Keyboard, ScrollView } from 'react-native';

import type { Station } from '../../../../domain/models/station';
import type { StationSearchState } from '../../../stores/station-search-store';
import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../../stores/use-map-stores';
import { StationResult } from './_station-result';

/** Tallest the results list grows before it scrolls. */
const MAX_HEIGHT = 250;

/**
 * Alternating press depths, which give the list a subtle zebra rhythm as you
 * run down it — straight from the Flutter original.
 */
const EVEN_ROW_MIN_OPACITY = 0.1;
const ODD_ROW_MIN_OPACITY = 0.6;

/**
 * The station hits for the current query.
 *
 * Picking one loads its reachability and collapses the list.
 */
export function SearchResults() {
  const state = useStationSearchStore((store) => store.state);
  const collapse = useStationSearchStore((store) => store.collapse);
  const loadReachability = useStationDeparturesStore(
    (store) => store.loadReachability
  );

  const stations = visibleStations(state);
  if (stations.length === 0) return null;

  const pick = (station: Station) => {
    void loadReachability(station);
    collapse();
    Keyboard.dismiss();
  };

  return (
    <ScrollView
      style={{ maxHeight: MAX_HEIGHT }}
      keyboardShouldPersistTaps="handled"
    >
      {stations.map((station, index) => (
        <StationResult
          key={station.id}
          station={station}
          minOpacity={
            index % 2 === 0 ? EVEN_ROW_MIN_OPACITY : ODD_ROW_MIN_OPACITY
          }
          onPress={() => pick(station)}
        />
      ))}
    </ScrollView>
  );
}

/** The hits worth showing — the loading state keeps the previous ones up. */
function visibleStations(state: StationSearchState): readonly Station[] {
  return state.status === 'loading' || state.status === 'loaded'
    ? state.stations
    : [];
}
