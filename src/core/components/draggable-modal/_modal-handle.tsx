import { View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 5;

/** The grab bar at the top of the sheet. */
export function ModalHandle(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: HANDLE_WIDTH,
          height: HANDLE_HEIGHT,
          borderRadius: theme.radii.full,
          backgroundColor: theme.colors.translucentBackgroundContrast,
        }}
      />
    </View>
  );
}
