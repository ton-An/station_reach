import { ScrollView, Text, View } from 'react-native';

import { Dot } from '@/core/components/dot';
import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { SmallIconButton } from '@/core/components/small-icon-button';
import {
  colorForDuration,
  interpolateColors,
  withAlpha,
} from '@/core/helpers/color-helper';
import { formatDuration } from '@/core/helpers/duration-helper';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import type { Departure } from '../../../domain/models/departure';
import { TransitModeIcon } from '../../components/transit-mode-icon';
import { useDepartureSelectionStore } from '../../stores/departure-selection-store';
import { useStationSelectionStore } from '../../stores/station-selection-store';

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
      <ScrollView contentContainerStyle={{ paddingTop: theme.spacing.xMedium }}>
        <Text
          style={[
            theme.text.body,
            { color: theme.colors.hint, textAlign: 'center' },
          ]}
        >
          {t('noStopSelected')}
        </Text>
      </ScrollView>
    );
  }

  const { departures, selectedStop } = state;

  return (
    <ScrollView
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
            theme.colors.secondaryGradient,
            index / Math.max(departures.length - 1, 1)
          )}
          showDivider={index !== departures.length - 1}
          onPress={() => selectDeparture(departure)}
        />
      ))}
    </ScrollView>
  );
}

interface DepartureRowProps {
  readonly departure: Departure;
  readonly durationMinutes: number;
  readonly accentColor: string;
  readonly showDivider: boolean;
  readonly onPress: () => void;
}

function DepartureRow({
  departure,
  durationMinutes,
  accentColor,
  showDivider,
  onPress,
}: DepartureRowProps) {
  const theme = useTheme();

  return (
    <FadePressable onPress={onPress}>
      <View style={{ paddingVertical: theme.spacing.xSmall }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xSmall,
          }}
        >
          <View
            style={{
              padding: theme.spacing.xxSmall,
              borderRadius: 999,
              backgroundColor: withAlpha(accentColor, 0.4),
            }}
          >
            <TransitModeIcon
              mode={departure.mode}
              size={20}
              color={theme.colors.background}
            />
          </View>

          <Gap size="xxSmall" />

          <Text
            numberOfLines={1}
            style={[theme.text.body, { color: theme.colors.text }]}
          >
            {departure.name}
          </Text>

          <Gap size="xSmall" />
          <Dot />
          <Gap size="xSmall" />

          <Text
            style={[
              theme.text.body,
              {
                flex: 1,
                color: colorForDuration(
                  theme.colors.timelineGradient,
                  durationMinutes
                ),
              },
            ]}
          >
            {formatDuration(durationMinutes)}
          </Text>

          {/* The whole row is the tap target; this is just the affordance. */}
          <SmallIconButton
            icon="arrow-forward-ios"
            onPress={onPress}
            nudge={[1, 0]}
            backgroundColor={theme.colors.transparent}
            decorative
          />
        </View>
      </View>

      {showDivider && (
        <View
          style={{
            height: 1,
            backgroundColor: theme.colors.translucentBackgroundContrast,
          }}
        />
      )}
    </FadePressable>
  );
}

/** How long this trip takes to reach the selected stop. */
function durationToStop(departure: Departure, stopId: string): number {
  return (
    departure.stops.find((stop) => stop.id === stopId)?.durationMinutes ?? 0
  );
}
