import { useCallback } from 'react';
import type { ListRenderItem } from 'react-native';

import { ModalList } from '@/core/components/draggable-modal';
import { interpolateColors } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';
import type { Departure } from '../../../../../domain/models/departure';
import {
  useDepartureSelectionStore,
  useStationSelectionStore,
} from '../../../../stores/use-map-stores';
import { DepartureRow } from './_departure-row';
import { DeparturesNoStopSelected } from './_departures-no-stop-selected';

const NO_DEPARTURES: readonly Departure[] = [];

/**
 * List of departures from the selected stop.
 *
 * Rows show the departure name, mode, and travel time to the selected stop.
 * Tapping a row selects it and slides to the full itinerary view.
 */
export function DeparturesList(): React.JSX.Element {
  const theme = useTheme();
  const state = useStationSelectionStore((store) => store.state);
  const selectDeparture = useDepartureSelectionStore((store) => store.select);

  const isSelected = state.status === 'selected';
  const departures = isSelected ? state.departures : NO_DEPARTURES;
  const selectedStopId = isSelected ? state.selectedStop.id : '';

  const renderDeparture = useCallback<ListRenderItem<Departure>>(
    ({ item: departure, index }) => (
      <DepartureRow
        departure={departure}
        durationMinutes={durationToStop(departure, selectedStopId)}
        accentColor={interpolateColors(
          theme.colors.secondaryGradient,
          index / Math.max(departures.length - 1, 1)
        )}
        showDivider={index !== departures.length - 1}
        onPress={selectDeparture}
      />
    ),
    [
      departures.length,
      selectedStopId,
      selectDeparture,
      theme.colors.secondaryGradient,
    ]
  );

  if (!isSelected) return <DeparturesNoStopSelected />;

  return (
    <ModalList
      data={departures}
      keyExtractor={departureKey}
      renderItem={renderDeparture}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.medium,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.large,
      }}
    />
  );
}

function departureKey(departure: Departure, index: number): string {
  return `${departure.id}-${index}`;
}

function durationToStop(departure: Departure, stopId: string): number {
  return (
    departure.stops.find((stop) => stop.id === stopId)?.durationMinutes ?? 0
  );
}
