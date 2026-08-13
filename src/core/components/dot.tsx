import { View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

/** The separator between a label and its trailing detail. */
export function Dot(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        width: 3,
        height: 3,
        borderRadius: theme.radii.full,
        backgroundColor: theme.colors.hint,
      }}
    />
  );
}
