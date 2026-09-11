import { Keyboard, ScrollView } from 'react-native';

import type { Station } from '../../../../domain/models/station';
import { visibleStations } from '../../../stores/station-search-store';
import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../../stores/use-map-stores';
import { SearchStationResult } from './_search-station-result';

const MAX_HEIGHT = 250;

/**
 * Picking a result loads its reachability, collapses the search and
 * dismisses the keyboard.
 */
export function SearchResults(): React.JSX.Element | null {
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
      {stations.map((station) => (
        <SearchStationResult
          key={station.id}
          station={station}
          onPress={() => pick(station)}
        />
      ))}
    </ScrollView>
  );
}
