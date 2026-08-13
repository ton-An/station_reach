import { Text, View } from 'react-native';

import { Dot } from '@/core/components/dot';
import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { useTheme } from '@/core/theme/use-theme';
import type { Station } from '../../../../domain/models/station';

interface StationResultProps {
  readonly station: Station;
  /** How far this row fades while held. The list alternates it. */
  readonly minOpacity: number;
  readonly onPress: () => void;
}

/** One station hit in the search results. */
export function StationResult({
  station,
  minOpacity,
  onPress,
}: StationResultProps): React.JSX.Element {
  const theme = useTheme();

  const area = describeArea(station);

  return (
    <FadePressable minOpacity={minOpacity} onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          // One line of body text plus its padding is 39pt, under the 44pt a
          // fingertip needs — a mouse never noticed the difference, a thumb
          // aiming at the gap between two rows did.
          minHeight: theme.spacing.large,
          paddingHorizontal: theme.spacing.medium,
          paddingVertical: theme.spacing.xSmall,
        }}
      >
        <Text style={[theme.text.body, { color: theme.colors.text }]}>
          {station.name}
        </Text>

        {area !== undefined && (
          <>
            <Gap size="xSmall" />
            <Dot />
            <Gap size="xSmall" />

            <Text
              numberOfLines={1}
              style={[theme.text.body, { color: theme.colors.hint, flex: 1 }]}
            >
              {area}
            </Text>
          </>
        )}
      </View>
    </FadePressable>
  );
}

/** Renders the country and area a station sits in, whichever are known. */
function describeArea(station: Station): string | undefined {
  const { countryCode, area } = station;

  if (countryCode !== undefined && area !== undefined) {
    return `${countryCode}, ${area}`;
  }

  return area ?? countryCode;
}
