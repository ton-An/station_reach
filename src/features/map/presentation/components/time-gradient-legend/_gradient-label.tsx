import { Text } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

interface GradientLabelProps {
  readonly text: string;
}

/**
 * Label displayed on the travel time gradient legend.
 */
export function GradientLabel({ text }: GradientLabelProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Text style={[theme.text.subhead, { color: theme.colors.background }]}>
      {text}
    </Text>
  );
}
