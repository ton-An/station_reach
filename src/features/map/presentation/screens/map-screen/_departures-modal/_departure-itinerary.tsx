import { Text, View } from 'react-native';

import { DottedTimeline } from '@/core/components/dotted-timeline';
import { ModalScrollView } from '@/core/components/draggable-modal';
import { Gap } from '@/core/components/gap';
import { ListIcon } from '@/core/components/list-icon';
import { ListItem } from '@/core/components/list-item';
import { colorForDuration } from '@/core/helpers/color-helper';
import { formatDuration } from '@/core/helpers/duration-helper';
import { useTheme } from '@/core/theme/use-theme';
import type { Departure } from '../../../../domain/models/departure';
import type { Stop } from '../../../../domain/models/station';

/** How much of the ramp survives in the pin behind each stop's icon. */
const PIN_ALPHA = 0.55;

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
    <ModalScrollView
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.medium,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.large,
      }}
    >
      {departure.stops.map((stop, index) => (
        // A circular route calls at the same stop twice, so the id alone is
        // not a key.
        <View key={`${stop.id}-${index}`}>
          <ItineraryStop stop={stop} />

          <ItineraryLeg from={stop} to={departure.stops[index + 1]} />
        </View>
      ))}
    </ModalScrollView>
  );
}

interface ItineraryStopProps {
  readonly stop: Stop;
}

/** One stop, named and timed from the origin. */
function ItineraryStop({ stop }: ItineraryStopProps) {
  const theme = useTheme();

  return (
    <ListItem
      title={stop.name}
      subtitle={formatDuration(stop.durationMinutes)}
      icon={
        <ListIcon
          icon="mapPin"
          color={colorForDuration({
            gradient: theme.colors.timelineGradient,
            durationMinutes: stop.durationMinutes,
            alpha: PIN_ALPHA,
          })}
        />
      }
    />
  );
}

interface ItineraryLegProps {
  readonly from: Stop;
  /** Absent at the end of the trip, where there is no leg to draw. */
  readonly to: Stop | undefined;
}

/** The dashed run between two stops, labelled with the hop's own duration. */
function ItineraryLeg({
  from,
  to,
}: ItineraryLegProps): React.JSX.Element | null {
  const theme = useTheme();

  if (to === undefined) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/*
        Aligns the dashes with the centre of the icon above: the pin is a 24pt
        glyph inside `spacing.medium` of padding, so its centre sits 26pt in,
        and the rule is 6pt wide.
      */}
      <View style={{ width: theme.spacing.xMedium - theme.spacing.tiny }} />

      <DottedTimeline />

      <Gap size="medium" />

      <Text style={[theme.text.body, { color: theme.colors.hint }]}>
        {`+ ${formatDuration(to.durationMinutes - from.durationMinutes)}`}
      </Text>
    </View>
  );
}
