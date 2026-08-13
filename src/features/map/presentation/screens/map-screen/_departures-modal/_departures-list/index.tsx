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
import { NoStopSelected } from './_no-stop-selected';

/** Hoisted, so the unselected case doesn't hand the list a fresh array. */
const NO_DEPARTURES: readonly Departure[] = [];

/**
 * The departures calling at the selected stop.
 *
 * Each row shows how long it takes to reach *this* stop on that trip, which is
 * not the same as how far the trip goes overall.
 */
export function DeparturesList(): React.JSX.Element {
  const theme = useTheme();
  const state = useStationSelectionStore((store) => store.state);
  const selectDeparture = useDepartureSelectionStore((store) => store.select);

  const isSelected = state.status === 'selected';
  const departures = isSelected ? state.departures : NO_DEPARTURES;
  const selectedStopId = isSelected ? state.selectedStop.id : '';

  // Stable, so the memoised rows survive a re-render of the sheet around them.
  // Each one draws two SVG glyphs, and a well-served stop has hundreds.
  const renderDeparture = useCallback<ListRenderItem<Departure>>(
    ({ item: departure, index }) => (
      <DepartureRow
        departure={departure}
        durationMinutes={durationToStop(departure, selectedStopId)}
        // Tinted by position in the list, not by travel time — the duration
        // already has a colour of its own two columns to the right.
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

  if (!isSelected) return <NoStopSelected />;

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

/**
 * Identifies a row.
 *
 * The index is part of it because a trip id is not unique here: one service can
 * appear twice under different route names, and the dedupe upstream only drops
 * trips whose *stops* match.
 */
function departureKey(departure: Departure, index: number): string {
  return `${departure.id}-${index}`;
}

/** How long this trip takes to reach the selected stop. */
function durationToStop(departure: Departure, stopId: string): number {
  return (
    departure.stops.find((stop) => stop.id === stopId)?.durationMinutes ?? 0
  );
}
