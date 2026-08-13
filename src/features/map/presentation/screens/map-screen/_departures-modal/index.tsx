import { View } from 'react-native';

import { DraggableModal } from '@/core/components/draggable-modal';
import { pointerEvents } from '@/core/components/pointer-events';
import { SlidingPanes } from '@/core/components/sliding-panes';
import { t } from '@/core/i18n/translate';
import { useIsWideLayout } from '@/core/theme/use-is-wide-layout';
import { useTheme } from '@/core/theme/use-theme';
import { MapLegends } from '../../../components/map-legends';
import type { DepartureSelectionState } from '../../../stores/departure-selection-store';
import type { StationSelectionState } from '../../../stores/station-selection-store';
import {
  useDepartureSelectionStore,
  useStationSelectionStore,
} from '../../../stores/use-map-stores';
import { DepartureItinerary } from './_departure-itinerary';
import { DeparturesList } from './_departures-list';

/**
 * Modal showing departures from the selected stop.
 *
 * Sub-components:
 * - DeparturesList: departures calling at the selected stop
 * - DepartureItinerary: all stops along the selected departure
 *
 * Sliding between the two panes is driven by departure selection.
 */
export function DeparturesModal(): React.JSX.Element {
  const theme = useTheme();
  const isWide = useIsWideLayout();

  const stationSelection = useStationSelectionStore((store) => store.state);
  const departureSelection = useDepartureSelectionStore((store) => store.state);
  const deselectDeparture = useDepartureSelectionStore(
    (store) => store.deselect
  );

  const isItineraryOpen = departureSelection.status === 'selected';

  return (
    <View
      style={[
        pointerEvents.passThrough,
        {
          flex: 1,
          width: '100%',
          maxWidth: theme.layout.overlayMaxWidth,
          alignSelf: isWide ? 'flex-end' : 'center',
          marginRight: isWide ? theme.spacing.medium : 0,
        },
      ]}
    >
      <DraggableModal
        title={modalTitle(stationSelection, departureSelection)}
        onBack={isItineraryOpen ? deselectDeparture : undefined}
        legend={isWide ? undefined : <MapLegends />}
      >
        <SlidingPanes
          isDetailOpen={isItineraryOpen}
          primary={<DeparturesList />}
          detail={<DepartureItinerary />}
        />
      </DraggableModal>
    </View>
  );
}

function modalTitle(
  stationSelection: StationSelectionState,
  departureSelection: DepartureSelectionState
): string {
  if (stationSelection.status === 'selected') {
    return stationSelection.selectedStop.name;
  }

  if (departureSelection.status === 'selected') {
    return departureSelection.departure.name;
  }

  return t('departures');
}
