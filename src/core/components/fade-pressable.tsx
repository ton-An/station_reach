import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/core/theme/use-theme';

interface FadePressableProps {
  readonly children: React.ReactNode;
  readonly onPress?: () => void;
  readonly onLongPress?: () => void;
  readonly minOpacity?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly accessibilityLabel?: string;
}

/**
 * Fades its children's opacity to signal press and hover.
 *
 * A press fades to `minOpacity`. A pointer hover (mouse, trackpad) fades
 * only halfway there. Both settle back to full opacity on release or
 * hover-out.
 */
export function FadePressable({
  children,
  onPress,
  onLongPress,
  minOpacity = 0.6,
  style,
  accessibilityLabel,
}: FadePressableProps): React.JSX.Element {
  const theme = useTheme();
  const opacity = useSharedValue(1);

  const fadeTo = (value: number) => {
    opacity.value = withTiming(value, { duration: theme.durations.short });
  };

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => fadeTo(minOpacity)}
      onPressOut={() => fadeTo(1)}
      onHoverIn={() => fadeTo((1 + minOpacity) / 2)}
      onHoverOut={() => fadeTo(1)}
      accessibilityRole={onPress === undefined ? undefined : 'button'}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View style={fadeStyle}>{children}</Animated.View>
    </Pressable>
  );
}
