import { Keyboard, ScrollView } from 'react-native';

import type { Station } from '../../../../domain/models/station';
import { visibleStations } from '../../../stores/station-search-store';
import {
  useStationDeparturesStore,
  useStationSearchStore,
} from '../../../stores/use-map-stores';
import { SearchStationResult } from './_search-station-result';

const MAX_HEIGHT = 250;

const EVEN_ROW_MIN_OPACITY = 0.1;
const ODD_ROW_MIN_OPACITY = 0.6;

/**
 * Scrollable list of search results.
 *
 * Tapping a result loads the station's departures and closes the search.
 * Rows alternate opacity for visual separation.
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
      {stations.map((station, index) => (
        <SearchStationResult
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
