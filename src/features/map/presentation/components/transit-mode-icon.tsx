import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import CoachIcon from '@/assets/icons/coach.svg';
import NightTrainIcon from '@/assets/icons/night_train.svg';
import { TransitMode } from '../../domain/models/transit-mode';

interface TransitModeIconProps {
  readonly mode: TransitMode;
  readonly size: number;
  readonly color: string;
}

/** Vector icon names for the modes the icon font already covers well. */
const ICON_NAMES: Partial<
  Record<
    TransitMode,
    React.ComponentProps<typeof MaterialCommunityIcons>['name']
  >
> = {
  [TransitMode.Rail]: 'train',
  [TransitMode.RegionalRail]: 'train',
  [TransitMode.RegionalFastRail]: 'train',
  [TransitMode.Suburban]: 'train',
  [TransitMode.HighspeedRail]: 'train-variant',
  [TransitMode.LongDistance]: 'train-variant',
  [TransitMode.Tram]: 'tram',
  [TransitMode.Subway]: 'subway-variant',
  [TransitMode.Metro]: 'subway-variant',
  [TransitMode.Bus]: 'bus',
  [TransitMode.Ferry]: 'ferry',
  [TransitMode.Funicular]: 'gondola',
  [TransitMode.CableCar]: 'gondola',
  [TransitMode.AerialLift]: 'gondola',
  [TransitMode.ArealLift]: 'gondola',
};

/**
 * The icon for a mode of transit.
 *
 * Most modes come from the icon font; coach and night rail use bundled SVGs
 * because no icon set carries a recognisable version of either.
 */
export function TransitModeIcon({ mode, size, color }: TransitModeIconProps) {
  if (mode === TransitMode.Coach) {
    return <CoachIcon width={size} height={size} fill={color} />;
  }

  if (mode === TransitMode.NightRail) {
    return <NightTrainIcon width={size} height={size} fill={color} />;
  }

  return (
    <MaterialCommunityIcons
      name={ICON_NAMES[mode] ?? 'help'}
      size={size}
      color={color}
    />
  );
}
