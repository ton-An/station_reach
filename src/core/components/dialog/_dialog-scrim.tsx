import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';

const SCRIM_OPACITY = 0.18;

interface DialogScrimProps {
  readonly entryAnimationValue: SharedValue<number>;
  readonly onPress: () => void;
}

/**
 * Backdrop behind the dialog card. Fades with `entryAnimationValue`;
 * tapping anywhere on it calls `onPress` to dismiss the dialog.
 */
export function DialogScrim({
  entryAnimationValue,
  onPress,
}: DialogScrimProps): React.JSX.Element {
  const theme = useTheme();

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: entryAnimationValue.value,
  }));

  return (
    <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          fadeStyle,
          {
            flex: 1,
            backgroundColor: withAlpha(
              theme.colors.backgroundContrast,
              SCRIM_OPACITY
            ),
          },
        ]}
      />
    </Pressable>
  );
}
