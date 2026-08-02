import { ScrollView, Text, View } from 'react-native';

import { DottedTimeline } from '@/core/components/dotted-timeline';
import { Gap } from '@/core/components/gap';
import { ListIcon, ListItem } from '@/core/components/list-item';
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
            <ListItem
              title={stop.name}
              subtitle={formatDuration(stop.durationMinutes)}
              icon={
                <ListIcon
                  icon="location-on"
                  color={colorForDuration(
                    theme.colors.timelineGradient,
                    stop.durationMinutes,
                    0.55
                  )}
                />
              }
            />

            {next !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Aligns the dashes with the centre of the icon above. */}
                <View
                  style={{
                    width: theme.spacing.xMedium - theme.spacing.tiny,
                  }}
                />

                <DottedTimeline />

                <Gap size="medium" />

                <Text style={[theme.text.body, { color: theme.colors.hint }]}>
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
