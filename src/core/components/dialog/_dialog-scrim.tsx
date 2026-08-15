import { Animated, Pressable, StyleSheet } from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';

const SCRIM_OPACITY = 0.18;

interface DialogScrimProps {
  readonly entryAnimationValue: Animated.Value;
  readonly onPress: () => void;
}

/**
 * Backdrop behind the dialog card. Fades in with `entryAnimationValue`;
 * tapping anywhere on it calls `onPress` to dismiss the dialog.
 */
export function DialogScrim({
  entryAnimationValue,
  onPress,
}: DialogScrimProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
      <Animated.View
        style={{
          flex: 1,
          opacity: entryAnimationValue,
          backgroundColor: withAlpha(
            theme.colors.backgroundContrast,
            SCRIM_OPACITY
          ),
        }}
      />
    </Pressable>
  );
}
