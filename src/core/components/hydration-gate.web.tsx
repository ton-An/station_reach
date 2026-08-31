import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/core/theme/use-theme';

interface HydrationGateProps {
  readonly children: React.ReactNode;
}

/**
 * Hides `children` until React has hydrated, then fades them in.
 */
export function HydrationGate({
  children,
}: HydrationGateProps): React.JSX.Element {
  const theme = useTheme();

  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: theme.durations.short });
  }, [opacity, theme.durations.short]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ flex: 1, backgroundColor: theme.colors.background }, fadeStyle]}
    >
      {children}
    </Animated.View>
  );
}
