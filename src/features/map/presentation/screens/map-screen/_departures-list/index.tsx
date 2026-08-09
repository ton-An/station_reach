import { Text } from 'react-native';

import { ModalScrollView } from '@/core/components/draggable-modal';
import { interpolateColors } from '@/core/helpers/color-helper';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import type { Departure } from '../../../../domain/models/departure';
import {
  useDepartureSelectionStore,
  useStationSelectionStore,
} from '../../../stores/use-map-stores';
import { DepartureRow } from './_departure-row';

/**
 * The departures calling at the selected stop.
 *
 * Each row shows how long it takes to reach *this* stop on that trip, which is
 * not the same as how far the trip goes overall.
 */
export function DeparturesList() {
  const theme = useTheme();
  const state = useStationSelectionStore((store) => store.state);
  const selectDeparture = useDepartureSelectionStore((store) => store.select);

  if (state.status === 'unselected') {
    return (
      <ModalScrollView
        contentContainerStyle={{ paddingTop: theme.spacing.xMedium }}
      >
        <Text
          style={[
            theme.text.body,
            { color: theme.colors.hint, textAlign: 'center' },
          ]}
        >
          {t('noStopSelected')}
        </Text>
      </ModalScrollView>
    );
  }

  const { departures, selectedStop } = state;

  return (
    <ModalScrollView
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.medium,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.large,
      }}
    >
      {departures.map((departure, index) => (
        <DepartureRow
          key={`${departure.id}-${index}`}
          departure={departure}
          durationMinutes={durationToStop(departure, selectedStop.id)}
          accentColor={interpolateColors(
            theme.colors.timelineGradient,
            index / Math.max(departures.length - 1, 1)
          )}
          showDivider={index !== departures.length - 1}
          onPress={() => selectDeparture(departure)}
        />
      ))}
    </ModalScrollView>
  );
}

/** How long this trip takes to reach the selected stop. */
function durationToStop(departure: Departure, stopId: string): number {
  return (
    departure.stops.find((stop) => stop.id === stopId)?.durationMinutes ?? 0
  );
}
