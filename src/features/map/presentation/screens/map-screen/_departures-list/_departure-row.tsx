import { Text, View } from 'react-native';

import { Dot } from '@/core/components/dot';
import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { SmallIconButton } from '@/core/components/small-icon-button';
import { colorForDuration, withAlpha } from '@/core/helpers/color-helper';
import { formatDuration } from '@/core/helpers/duration-helper';
import { useTheme } from '@/core/theme/use-theme';
import type { Departure } from '../../../../domain/models/departure';
import { TransitModeIcon } from '../../../components/transit-mode-icon';

interface DepartureRowProps {
  readonly departure: Departure;
  /** Time to the *selected* stop, not to the end of the trip. */
  readonly durationMinutes: number;
  readonly accentColor: string;
  readonly showDivider: boolean;
  readonly onPress: () => void;
}

/** One departure in the list. */
export function DepartureRow({
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
            icon="arrowForward"
            onPress={onPress}
            alignmentOffset={[1, 0]}
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
