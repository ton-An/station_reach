import { Text, View } from 'react-native';

import { DottedTimeline } from '@/core/components/dotted-timeline';
import { ModalScrollView } from '@/core/components/draggable-modal';
import { Gap } from '@/core/components/gap';
import { ListIcon } from '@/core/components/list-icon';
import { ListItem } from '@/core/components/list-item';
import { colorForDuration } from '@/core/helpers/color-helper';
import { formatDuration } from '@/core/helpers/duration-helper';
import { useTheme } from '@/core/theme/use-theme';
import type { Stop } from '../../../../domain/models/station';
import { useDepartureSelectionStore } from '../../../stores/use-map-stores';

const PIN_ALPHA = 0.55;

export function DepartureItinerary(): React.JSX.Element | null {
  const theme = useTheme();
  const selection = useDepartureSelectionStore((store) => store.state);

  if (selection.status !== 'selected') return null;

  const { departure } = selection;

  return (
    <ModalScrollView
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.medium,
        paddingTop: theme.spacing.medium,
        paddingBottom: theme.spacing.large,
      }}
    >
      {departure.stops.map((stop, index) => (
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

function ItineraryStop({ stop }: ItineraryStopProps): React.JSX.Element {
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
  readonly to: Stop | undefined;
}

function ItineraryLeg({
  from,
  to,
}: ItineraryLegProps): React.JSX.Element | null {
  const theme = useTheme();

  if (to === undefined) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: theme.spacing.xMedium - theme.spacing.tiny }} />

      <DottedTimeline />

      <Gap size="medium" />

      <Text style={[theme.text.body, { color: theme.colors.hint }]}>
        {`+ ${formatDuration(to.durationMinutes - from.durationMinutes)}`}
      </Text>
    </View>
  );
}
