import { Text, View } from 'react-native';

import { Gap } from '@/core/components/gap';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { colorForDuration } from '@/core/helpers/color-helper';
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
 * time to it drawn in that time's own colour from
 * {@link colorForDuration} — the same colour the marker under the card
 * carries, so the number and the dot read as one value.
 */
export function StationCallout({
  name,
  durationMinutes,
}: StationCalloutProps): React.JSX.Element {
  const theme = useTheme();

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

        <Text
          numberOfLines={1}
          style={[
            theme.text.footnote,
            {
              // The name gives way, never the time: a wrapped duration
              // turns the one-line card into a two-line one.
              flexShrink: 0,
              color: colorForDuration({
                gradient: theme.colors.timelineGradient,
                durationMinutes,
              }),
            },
          ]}
        >
          {formatDuration(durationMinutes)}
        </Text>
      </View>
    </TranslucentSurface>
  );
}
