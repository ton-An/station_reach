import { View } from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';
import { Icon, type IconName } from './icon';

interface ListIconProps {
  readonly icon: IconName;
  /** Fills the circle behind the glyph. */
  readonly color: string;
}

/** The filled circular icon that leads a `ListItem`. */
export function ListIcon({ icon, color }: ListIconProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        padding: theme.spacing.medium,
        borderRadius: theme.radii.full,
        backgroundColor: color,
      }}
    >
      <Icon
        name={icon}
        size={24}
        color={withAlpha(theme.colors.backgroundContrast, 0.6)}
      />
    </View>
  );
}
