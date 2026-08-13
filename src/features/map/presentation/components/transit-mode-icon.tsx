import { Icon, type IconName } from '@/core/components/icon';
import { TransitMode } from '../../domain/models/transit-mode';

/**
 * Maps transit modes to their corresponding icon names.
 *
 * Multiple modes may map to the same icon where visual distinction is not
 * necessary.
 */
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

/**
 * Renders an icon for a transit mode.
 *
 * Falls back to a question mark if the mode is not mapped.
 *
 * @param mode - The transit mode to display.
 * @param size - The icon size in pixels.
 * @param color - The icon color.
 */
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
