import { Text } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

interface GradientLabelProps {
  readonly text: string;
}

export function GradientLabel({ text }: GradientLabelProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Text style={[theme.text.subhead, { color: theme.colors.primaryContrast }]}>
      {text}
    </Text>
  );
}
