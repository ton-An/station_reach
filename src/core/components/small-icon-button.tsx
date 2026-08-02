import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';

interface SmallIconButtonProps {
  readonly icon: React.ComponentProps<typeof MaterialIcons>['name'];
  readonly onPress: () => void;
  /**
   * Nudges the glyph inside its circle.
   *
   * Chevrons are not optically centred in their own box, so the button that
   * holds one needs a pixel of correction to look centred.
   */
  readonly nudge?: readonly [number, number];
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
  nudge = [0, 0],
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
        borderRadius: 999,
        backgroundColor:
          backgroundColor ?? theme.colors.translucentBackgroundContrast,
      }}
    >
      <View
        style={{
          transform: [{ translateX: nudge[0] }, { translateY: nudge[1] }],
        }}
      >
        <MaterialIcons name={icon} size={24} color={theme.colors.text} />
      </View>
    </Animated.View>
  );

  if (decorative) return circle;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => fadeTo(0.4, 215)}
      onPressOut={() => fadeTo(1, 250)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {circle}
    </Pressable>
  );
}
