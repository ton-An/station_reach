import { Animated, Pressable, StyleSheet } from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';

const SCRIM_OPACITY = 0.18;

interface DialogScrimProps {
  /** The dialog's shared entry progress, from 0 to 1. */
  readonly progress: Animated.Value;
  readonly onPress: () => void;
}

/**
 * The dimmed backdrop, which also dismisses the dialog.
 *
 * It carries the whole entry fade, because {@link DialogCard} cannot be faded
 * without losing its blur.
 */
export function DialogScrim({
  progress,
  onPress,
}: DialogScrimProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
      <Animated.View
        style={{
          flex: 1,
          opacity: progress,
          backgroundColor: withAlpha(
            theme.colors.backgroundContrast,
            SCRIM_OPACITY
          ),
        }}
      />
    </Pressable>
  );
}
