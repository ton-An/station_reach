import { Text, View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';
import { Gap } from './gap';

interface ListItemProps {
  readonly title: string;
  readonly subtitle: string;
  /** Normally a {@link ListIcon}. */
  readonly icon: React.ReactNode;
}

/** A leading icon beside a stacked title and subtitle. */
export function ListItem({
  title,
  subtitle,
  icon,
}: ListItemProps): React.JSX.Element {
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
