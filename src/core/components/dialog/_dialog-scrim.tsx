import { Animated, Pressable, StyleSheet } from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';

/** The dimming behind the card — light, because the card is itself blurred. */
const SCRIM_OPACITY = 0.18;

interface DialogScrimProps {
  /** The dialog's shared 0..1 entry progress. */
  readonly progress: Animated.Value;
  readonly onPress: () => void;
}

/**
 * The dimmed backdrop, which also dismisses the dialog.
 *
 * It carries the whole entry fade on its own: the card above it must not be
 * faded, because an ancestor with opacity below 1 becomes a backdrop root and
 * leaves the card's blur with nothing behind it to sample.
 */
export function DialogScrim({ progress, onPress }: DialogScrimProps) {
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
