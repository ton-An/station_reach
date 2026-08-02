import { BlurView } from 'expo-blur';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';

interface TranslucentSurfaceProps {
  readonly children: React.ReactNode;
  readonly radius?: number;
  readonly bordered?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * A blurred, translucent panel floating over the map.
 *
 * Every chrome surface in the app — search bar, modal, legends — is one of
 * these, so the map stays readable underneath.
 */
export function TranslucentSurface({
  children,
  radius,
  bordered = false,
  style,
}: TranslucentSurfaceProps) {
  const theme = useTheme();
  const borderRadius = radius ?? theme.radii.button;

  return (
    <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
      <BlurView
        intensity={theme.misc.blurIntensity}
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      <View
        style={{
          borderRadius,
          backgroundColor: theme.colors.translucentBackground,
          ...(bordered
            ? {
                borderWidth: 1.8,
                borderColor: theme.colors.translucentBackgroundContrast,
              }
            : {}),
        }}
      >
        {children}
      </View>
    </View>
  );
}
