import { memo, useCallback } from 'react';
import { Text, View } from 'react-native';

import { Dot } from '@/core/components/dot';
import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { SmallIconButton } from '@/core/components/small-icon-button';
import { colorForDuration, withAlpha } from '@/core/helpers/color-helper';
import { formatDuration } from '@/core/helpers/duration-helper';
import { useTheme } from '@/core/theme/use-theme';
import type { Departure } from '../../../../../domain/models/departure';
import { TransitModeIcon } from '../../../../components/transit-mode-icon';

/** How much of the row's accent colour survives behind the mode glyph. */
const ICON_BACKGROUND_ALPHA = 0.4;

const MODE_ICON_SIZE = 20;

interface DepartureRowProps {
  readonly departure: Departure;
  /** Time to the *selected* stop, not to the end of the trip. */
  readonly durationMinutes: number;
  /** Fills the circle behind the mode glyph. */
  readonly accentColor: string;
  readonly showDivider: boolean;
  /** Takes the departure, so the list can hand every row one stable callback. */
  readonly onPress: (departure: Departure) => void;
}

/**
 * One departure in the list.
 *
 * Memoised: the list is virtualised but its rows still re-render whenever the
 * sheet around them does, and each one draws two SVG glyphs. Every prop is a
 * primitive or a stable reference, so the memo actually holds.
 */
export const DepartureRow = memo(function DepartureRow({
  departure,
  durationMinutes,
  accentColor,
  showDivider,
  onPress,
}: DepartureRowProps): React.JSX.Element {
  const theme = useTheme();

  const handlePress = useCallback(
    () => onPress(departure),
    [onPress, departure]
  );

  return (
    <FadePressable onPress={handlePress}>
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
              borderRadius: theme.radii.full,
              backgroundColor: withAlpha(accentColor, ICON_BACKGROUND_ALPHA),
            }}
          >
            <TransitModeIcon
              mode={departure.mode}
              size={MODE_ICON_SIZE}
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
                color: colorForDuration({
                  gradient: theme.colors.timelineGradient,
                  durationMinutes,
                }),
              },
            ]}
          >
            {formatDuration(durationMinutes)}
          </Text>

          {/* The whole row is the tap target; this is just the affordance. */}
          <SmallIconButton
            icon="chevronRight"
            onPress={handlePress}
            alignmentOffset={[1, 0]}
            backgroundColor={theme.colors.transparent}
            decorative
          />
        </View>
      </View>

      {showDivider && (
        <View
          style={{
            height: theme.spacing.tiny,
            backgroundColor: theme.colors.translucentBackgroundContrast,
          }}
        />
      )}
    </FadePressable>
  );
});
