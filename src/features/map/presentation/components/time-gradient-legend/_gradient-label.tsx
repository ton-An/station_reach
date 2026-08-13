import { Text } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

interface GradientLabelProps {
  readonly text: string;
}

/** A tick label sitting on top of the gradient bar. */
export function GradientLabel({ text }: GradientLabelProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Text style={[theme.text.subhead, { color: theme.colors.background }]}>
      {text}
    </Text>
  );
}
