import { View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

/** The 3px separator between a label and its trailing detail. */
export function Dot() {
  const theme = useTheme();

  return (
    <View
      style={{
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: theme.colors.hint,
      }}
    />
  );
}
