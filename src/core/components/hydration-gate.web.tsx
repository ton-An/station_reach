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
 *
 * The static web build prerenders in Node, where `Dimensions` reports a 0x0
 * window, so every {@link useIsWideLayout} branch renders narrow. The browser
 * paints that phone layout before the bundle hydrates and replaces it. The
 * gate trades that flash for a blank frame: the prerendered markup carries
 * `opacity: 0`, and only the first effect — which runs after hydration, with
 * the real window measured — reveals it.
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
