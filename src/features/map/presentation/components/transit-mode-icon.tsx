import { Icon, type IconName } from '@/core/components/icon';
import { TransitMode } from '../../domain/models/transit-mode';

const MODE_ICONS: Partial<Record<TransitMode, IconName>> = {
  [TransitMode.Rail]: 'train',
  [TransitMode.RegionalFastRail]: 'train',
  [TransitMode.RegionalRail]: 'train',
  [TransitMode.Suburban]: 'train',
  [TransitMode.LongDistance]: 'train',
  [TransitMode.HighspeedRail]: 'highspeedRail',
  [TransitMode.NightRail]: 'nightTrain',

  [TransitMode.Tram]: 'tram',
  [TransitMode.Subway]: 'subway',
  [TransitMode.Metro]: 'subway',

  [TransitMode.Bus]: 'bus',
  [TransitMode.Coach]: 'coach',
  [TransitMode.Ferry]: 'ship',
  [TransitMode.Funicular]: 'funicular',
  [TransitMode.CableCar]: 'cableCar',
};

interface TransitModeIconProps {
  readonly mode: TransitMode;
  readonly size: number;
  readonly color: string;
}

export function TransitModeIcon({
  mode,
  size,
  color,
}: TransitModeIconProps): React.JSX.Element {
  return (
    <Icon
      name={MODE_ICONS[mode] ?? 'circleQuestionMark'}
      size={size}
      color={color}
    />
  );
}
