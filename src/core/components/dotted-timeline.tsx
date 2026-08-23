import { View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

const HEIGHT = 60;
const VERTICAL_INSET = 6;

const DASH_LENGTH = 9;
const DASH_GAP = 9;
export const DASH_THICKNESS = 6;
const DASH_RADIUS = 2;

export function DottedTimeline(): React.JSX.Element {
  const theme = useTheme();

  const usableHeight = HEIGHT - VERTICAL_INSET * 2;
  const dashCount = Math.floor(
    (usableHeight + DASH_GAP) / (DASH_LENGTH + DASH_GAP)
  );

  return (
    <View
      style={{
        height: HEIGHT,
        width: DASH_THICKNESS,
        paddingVertical: VERTICAL_INSET,
        justifyContent: 'space-between',
      }}
    >
      {Array.from({ length: Math.max(dashCount, 1) }, (_, index) => (
        <View
          key={index}
          style={{
            width: DASH_THICKNESS,
            height: DASH_LENGTH,
            borderRadius: DASH_RADIUS,
            backgroundColor: theme.colors.translucentBackgroundContrast,
          }}
        />
      ))}
    </View>
  );
}
