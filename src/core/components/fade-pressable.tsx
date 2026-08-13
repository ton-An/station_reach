import { useState } from 'react';
import {
  Animated,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';

interface FadePressableProps {
  readonly children: React.ReactNode;
  readonly onPress?: () => void;
  readonly onLongPress?: () => void;
  /** How far to fade while held. A hover fades half that far. */
  readonly minOpacity?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly accessibilityLabel?: string;
}

/** A tap target that fades while pressed. */
export function FadePressable({
  children,
  onPress,
  onLongPress,
  minOpacity = 0.6,
  style,
  accessibilityLabel,
}: FadePressableProps): React.JSX.Element {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(1));

  const fadeTo = (value: number) =>
    Animated.timing(opacity, {
      toValue: value,
      duration: theme.durations.short,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

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
      <Animated.View style={{ opacity }}>{children}</Animated.View>
    </Pressable>
  );
}
