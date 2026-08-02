import { View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

/** The grab bar at the top of the sheet. */
export function ModalHandle() {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          height: 5,
          width: 36,
          borderRadius: 5,
          backgroundColor: theme.colors.translucentBackgroundContrast,
        }}
      />
    </View>
  );
}
