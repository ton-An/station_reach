import { Icon, type IconName } from '@/core/components/icon';
import { TransitMode } from '../../domain/models/transit-mode';

/**
 * The glyph for each mode.
 *
 * Every vehicle is drawn head-on except the two that climb, which only read
 * from the side. Modes that share a silhouette are separated by the cue the
 * real vehicle carries: the tram by its pantograph, the coach by its stalked
 * wing mirrors and destination board, the subway by the tunnel around it.
 * Rail and road are told apart by the underframe — splayed on rail, straight
 * on road — which is Lucide's own convention.
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
 * The icon for a mode of transit.
 *
 * Modes with no icon of their own fall back to a question mark rather than
 * borrowing a neighbouring mode's glyph — showing a tram for an airplane would
 * be worse than admitting we don't have one.
 */
export function TransitModeIcon({ mode, size, color }: TransitModeIconProps) {
  return (
    <Icon
      name={MODE_ICONS[mode] ?? 'circleQuestionMark'}
      size={size}
      color={color}
    />
  );
}
