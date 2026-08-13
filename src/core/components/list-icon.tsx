import { View } from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';
import { Icon, type IconName } from './icon';

const GLYPH_ALPHA = 0.6;

interface ListIconProps {
  readonly icon: IconName;
  readonly color: string;
}

export function ListIcon({ icon, color }: ListIconProps): React.JSX.Element {
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
        color={withAlpha(theme.colors.backgroundContrast, GLYPH_ALPHA)}
      />
    </View>
  );
}
