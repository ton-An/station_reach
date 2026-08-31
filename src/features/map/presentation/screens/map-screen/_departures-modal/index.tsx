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
 * The departures panel: a {@link DraggableModal} that slides between the
 * departures list and a selected departure's itinerary.
 *
 * The title follows the current selection — the selected stop, then the
 * selected departure, then a generic fallback. The back button appears only
 * once a departure is selected, and returns to the list. The legend renders
 * inside the sheet on narrow layouts; {@link MapScreen} renders it standalone
 * on wide ones.
 *
 * Sub-components:
 * - {@link DeparturesList}: departures reaching the selected stop
 * - {@link DepartureItinerary}: the stops of the selected departure
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
