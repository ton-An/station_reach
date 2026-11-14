import { Text, View } from 'react-native';

import { Gap } from '@/core/components/gap';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { colorForDuration, contrastOn } from '@/core/helpers/color-helper';
import { formatDuration } from '@/core/helpers/duration-helper';
import { useTheme } from '@/core/theme/use-theme';

interface StationCalloutProps {
  readonly name: string;
  readonly durationMinutes: number;
}

/**
 * Labels a station marker with the stop's name and the travel time to it.
 *
 * The time sits on a chip filled with the same `colorForDuration` colour the
 * marker carries, its digits picked by {@link contrastOn}. Seven of the
 * scale's twelve stops read below 3:1 as text on a light surface, and they
 * are the short travel times, the half of the map people read most.
 * Darkening the scale until it carries instead would put half an hour and
 * four hours at the same lightness, and the scale would stop meaning
 * anything.
 *
 * Both map implementations render this card, each anchoring it to its own
 * marker: the web one portals it into the marker's element, the native one
 * puts it in a `ViewAnnotation`.
 */
export function StationCallout({
  name,
  durationMinutes,
}: StationCalloutProps): React.JSX.Element {
  const theme = useTheme();

  const timeColor = colorForDuration({
    gradient: theme.colors.timelineGradient,
    durationMinutes,
  });

  return (
    <TranslucentSurface radius={theme.radii.small}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          maxWidth: theme.layout.calloutMaxWidth,
          paddingVertical: theme.spacing.xSmall,
          paddingHorizontal: theme.spacing.xxSmall,
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
            paddingVertical: theme.spacing.xTiny,
            paddingHorizontal: theme.spacing.xSmall,
            borderRadius: theme.radii.full,
            backgroundColor: timeColor,
          }}
        >
          <Text style={[theme.text.caption1, { color: contrastOn(timeColor) }]}>
            {formatDuration(durationMinutes)}
          </Text>
        </View>
      </View>
    </TranslucentSurface>
  );
}
