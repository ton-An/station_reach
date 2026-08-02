import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, Text, View } from 'react-native';

import { Gap } from '@/core/components/gap';
import { colorForDuration } from '@/core/helpers/color-helper';
import { formatDuration } from '@/core/helpers/duration-helper';
import { useTheme } from '@/core/theme/use-theme';
import type { Departure } from '../../../domain/models/departure';

interface DepartureItineraryProps {
  readonly departure: Departure | undefined;
}

/**
 * Every stop along a departure, with the running travel time.
 *
 * Between each pair of stops the leg's own duration is shown as `+ 12m`, so a
 * long gap between two stations is visible rather than implied.
 */
export function DepartureItinerary({ departure }: DepartureItineraryProps) {
  const theme = useTheme();

  if (departure === undefined) return null;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.medium,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.large,
      }}
    >
      {departure.stops.map((stop, index) => {
        const next = departure.stops[index + 1];

        return (
          <View key={`${stop.id}-${index}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons
                name="location-on"
                size={22}
                color={colorForDuration(
                  theme.colors.timelineGradient,
                  stop.durationMinutes,
                  0.55
                )}
              />

              <Gap size="xSmall" />

              <View style={{ flexShrink: 1 }}>
                <Text
                  numberOfLines={1}
                  style={[theme.text.body, { color: theme.colors.text }]}
                >
                  {stop.name}
                </Text>

                <Text
                  style={[theme.text.footnote, { color: theme.colors.hint }]}
                >
                  {formatDuration(stop.durationMinutes)}
                </Text>
              </View>
            </View>

            {next !== undefined && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: theme.spacing.xSmall,
                  paddingVertical: theme.spacing.small,
                }}
              >
                <View
                  style={{
                    width: 2,
                    height: 18,
                    borderRadius: 1,
                    backgroundColor: theme.colors.translucentBackgroundContrast,
                  }}
                />

                <Gap size="xxSmall" />

                <Text
                  style={[theme.text.footnote, { color: theme.colors.hint }]}
                >
                  {`+ ${formatDuration(
                    next.durationMinutes - stop.durationMinutes
                  )}`}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
