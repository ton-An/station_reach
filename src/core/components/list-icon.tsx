import { View } from 'react-native';

import { icons, spacing } from '@/core/theme/theme';
import { useTheme } from '@/core/theme/use-theme';

import { Icon, type IconName } from './icon';

/** Outer diameter, for callers that line something up with the circle. */
export const LIST_ICON_DIAMETER = spacing.medium * 2 + icons.medium;

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
        size={theme.icons.medium}
        color={theme.colors.primaryContrast}
      />
    </View>
  );
}
