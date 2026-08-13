import { Text, View } from 'react-native';

import { Dot } from '@/core/components/dot';
import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { useTheme } from '@/core/theme/use-theme';
import type { Station } from '../../../../domain/models/station';

interface StationResultProps {
  readonly station: Station;
  readonly minOpacity: number;
  readonly onPress: () => void;
}

/**
 * A single station search result showing the station name and location area.
 */
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

function describeArea(station: Station): string | undefined {
  const { countryCode, area } = station;

  if (countryCode !== undefined && area !== undefined) {
    return `${countryCode}, ${area}`;
  }

  return area ?? countryCode;
}
