import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View } from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';

interface ListIconProps {
  readonly icon: React.ComponentProps<typeof MaterialIcons>['name'];
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
        borderRadius: 999,
        backgroundColor: color,
      }}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color={withAlpha(theme.colors.backgroundContrast, 0.6)}
      />
    </View>
  );
}
