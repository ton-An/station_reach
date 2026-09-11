import { Text, View } from 'react-native';

import { Dot } from '@/core/components/dot';
import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { useTheme } from '@/core/theme/use-theme';

import type { Station } from '../../../../domain/models/station';

interface SearchStationResultProps {
  readonly station: Station;
  readonly onPress: () => void;
}

export function SearchStationResult({
  station,
  onPress,
}: SearchStationResultProps): React.JSX.Element {
  const theme = useTheme();

  const area = describeArea(station);

  return (
    <FadePressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: theme.spacing.xLarge,
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
