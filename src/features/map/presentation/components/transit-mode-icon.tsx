import { View } from 'react-native';

import { Icon, type IconName } from '@/core/components/icon';
import { TransitMode } from '../../domain/models/transit-mode';

/**
 * The glyph for each mode, and how far it needs lifting.
 *
 * Some of these icons are not optically centred in their own box — the tram
 * and subway sit low, the night train lower still — so they carry the same
 * bottom padding the Flutter `IconHelper` applied, expressed as a fraction of
 * the icon size so it scales with them.
 */
const MODE_ICONS: Partial<
  Record<
    TransitMode,
    { readonly name: IconName; readonly liftFraction?: number }
  >
> = {
  [TransitMode.Rail]: { name: 'train' },
  [TransitMode.RegionalFastRail]: { name: 'train' },
  [TransitMode.RegionalRail]: { name: 'train' },
  [TransitMode.Suburban]: { name: 'train' },
  [TransitMode.HighspeedRail]: { name: 'train' },
  [TransitMode.LongDistance]: { name: 'train' },

  [TransitMode.Tram]: { name: 'tram', liftFraction: 0.15 },
  [TransitMode.Subway]: { name: 'subway', liftFraction: 0.15 },
  [TransitMode.Metro]: { name: 'subway', liftFraction: 0.15 },
  [TransitMode.NightRail]: { name: 'nightTrain', liftFraction: 0.2 },

  [TransitMode.Bus]: { name: 'directionsBus' },
  [TransitMode.Coach]: { name: 'coach' },
  [TransitMode.Ferry]: { name: 'directionsBoat' },
  [TransitMode.Funicular]: { name: 'funicular' },
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
 * borrowing a neighbouring mode's glyph — showing a tram for a cable car would
 * be worse than admitting we don't have one.
 */
export function TransitModeIcon({ mode, size, color }: TransitModeIconProps) {
  const icon = MODE_ICONS[mode] ?? { name: 'questionMark' as const };
  const lift = (icon.liftFraction ?? 0) * size;

  if (lift === 0) return <Icon name={icon.name} size={size} color={color} />;

  return (
    <View style={{ paddingBottom: lift }}>
      <Icon name={icon.name} size={size} color={color} />
    </View>
  );
}
