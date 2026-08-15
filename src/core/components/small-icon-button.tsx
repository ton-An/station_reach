import { useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';
import { Icon, type IconName } from './icon';

const FADE_OUT_MS = 215;
const PRESSED_OPACITY = 0.4;

interface SmallIconButtonProps {
  readonly icon: IconName;
  readonly onPress: () => void;
  readonly alignmentOffset?: readonly [number, number];
  readonly backgroundColor?: string;
  readonly accessibilityLabel?: string;
  readonly decorative?: boolean;
}

/**
 * Icon in a filled circle, fading on press.
 *
 * `decorative` renders the same circle without a `Pressable`: no press
 * fade and no accessibility role, for keeping icons visually balanced
 * where one side has no action.
 *
 * @param alignmentOffset - `[x, y]` pixel nudge for a glyph that renders
 * off-centre in its circle.
 */
export function SmallIconButton({
  icon,
  onPress,
  alignmentOffset = [0, 0],
  backgroundColor,
  accessibilityLabel,
  decorative = false,
}: SmallIconButtonProps): React.JSX.Element {
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
      onPressOut={() => fadeTo(1, theme.durations.xShort)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {circle}
    </Pressable>
  );
}
