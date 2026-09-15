import { Text, View } from 'react-native';

import { Gap } from '@/core/components/gap';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { colorForDuration, contrastOn } from '@/core/helpers/color-helper';
import { formatDuration } from '@/core/helpers/duration-helper';
import { useTheme } from '@/core/theme/use-theme';

/**
 * Widest the name may run before it is cut. Wide enough for the long
 * compound station names the data is full of, narrow enough that the card
 * never covers the markers it sits among.
 */
const MAX_WIDTH = 240;

interface StationCalloutProps {
  readonly name: string;
  readonly durationMinutes: number;
}

/**
 * The card that labels a station marker: the stop's name, and the travel
 * time to it on a chip filled with that time's own colour from
 * {@link colorForDuration} — the same colour the marker under the card
 * carries, so the number and the dot read as one value.
 *
 * The colour fills the chip rather than the digits. Seven of the scale's
 * twelve stops fall below 3:1 as text on this surface, and its yellow
 * reaches 1.4:1, which no amount of weight rescues. Darkening the scale
 * until it reads as text flattens its light half to one lightness and
 * costs the scale its meaning. As a fill it keeps every colour exactly,
 * and {@link contrastOn} picks the digits to suit each one.
 */
export function StationCallout({
  name,
  durationMinutes,
}: StationCalloutProps): React.JSX.Element {
  const theme = useTheme();

  const durationColor = colorForDuration({
    gradient: theme.colors.timelineGradient,
    durationMinutes,
  });

  return (
    <TranslucentSurface
      radius={theme.radii.small}
      style={{ maxWidth: MAX_WIDTH }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.xSmall,
          paddingVertical: theme.spacing.small,
        }}
      >
        <Text
          numberOfLines={1}
          style={[
            theme.text.footnote,
            { flexShrink: 1, color: theme.colors.text },
          ]}
        >
          {name}
        </Text>

        <Gap size="xSmall" />

        <View
          style={{
            // The name gives way, never the time: a wrapped duration turns
            // the one-line card into a two-line one.
            flexShrink: 0,
            paddingHorizontal: theme.spacing.xSmall,
            paddingVertical: theme.spacing.xTiny,
            borderRadius: theme.radii.small,
            backgroundColor: durationColor,
          }}
        >
          <Text
            numberOfLines={1}
            style={[
              theme.text.footnote,
              {
                color: contrastOn(durationColor, [
                  theme.colors.text,
                  theme.colors.primaryContrast,
                ]),
              },
            ]}
          >
            {formatDuration(durationMinutes)}
          </Text>
        </View>
      </View>
    </TranslucentSurface>
  );
}
