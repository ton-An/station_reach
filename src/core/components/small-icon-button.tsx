import { useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';
import { Icon, type IconName } from './icon';

/** How the press fade behaves, matching the Flutter `SmallIconButton`. */
const FADE_OUT_MS = 215;
const FADE_IN_MS = 250;
const PRESSED_OPACITY = 0.4;

interface SmallIconButtonProps {
  readonly icon: IconName;
  readonly onPress: () => void;
  /**
   * Nudges the glyph inside its circle, in pixels.
   *
   * Chevrons are not optically centred in their own box, so the button that
   * holds one needs a pixel of correction to look centred. Same values the
   * Flutter `alignmentOffset` used: `[-1, 0]` for back, `[1, 0]` for forward.
   */
  readonly alignmentOffset?: readonly [number, number];
  readonly backgroundColor?: string;
  readonly accessibilityLabel?: string;
  /**
   * Render as a plain affordance rather than a real button.
   *
   * Used when the button sits inside an already-tappable row: nesting one
   * pressable in another produces invalid `<button>` markup on web and makes
   * the inner target swallow the outer one.
   */
  readonly decorative?: boolean;
}

/** A circular icon button that dips in opacity while held. */
export function SmallIconButton({
  icon,
  onPress,
  alignmentOffset = [0, 0],
  backgroundColor,
  accessibilityLabel,
  decorative = false,
}: SmallIconButtonProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(1));

  const fadeTo = (value: number, duration: number) =>
    Animated.timing(opacity, {
      toValue: value,
      duration,
      easing: value === 1 ? Easing.in(Easing.ease) : Easing.out(Easing.ease),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

  const circle = (
    <Animated.View
      style={{
        opacity: decorative ? 1 : opacity,
        padding: theme.spacing.xSmall,
        borderRadius: theme.radii.full,
        backgroundColor:
          backgroundColor ?? theme.colors.translucentBackgroundContrast,
      }}
    >
      <View
        style={{
          transform: [
            { translateX: alignmentOffset[0] },
            { translateY: alignmentOffset[1] },
          ],
        }}
      >
        <Icon name={icon} size={24} color={theme.colors.text} />
      </View>
    </Animated.View>
  );

  if (decorative) return circle;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => fadeTo(PRESSED_OPACITY, FADE_OUT_MS)}
      onPressOut={() => fadeTo(1, FADE_IN_MS)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {circle}
    </Pressable>
  );
}
