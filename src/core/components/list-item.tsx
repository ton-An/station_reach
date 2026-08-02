import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View } from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';
import { Gap } from './gap';

interface ListIconProps {
  readonly icon: React.ComponentProps<typeof MaterialIcons>['name'];
  /** Fills the circle behind the glyph. */
  readonly color: string;
}

/** The filled circular icon that leads a {@link ListItem}. */
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

interface ListItemProps {
  readonly title: string;
  readonly subtitle: string;
  readonly icon: React.ReactNode;
}

/** A leading icon beside a stacked title and subtitle. */
export function ListItem({ title, subtitle, icon }: ListItemProps) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {icon}

      <Gap size="xxSmall" />

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={[theme.text.headline, { color: theme.colors.text }]}
        >
          {title}
        </Text>

        <Gap size="xTiny" axis="vertical" />

        <Text style={[theme.text.body, { color: theme.colors.text }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
