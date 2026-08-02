import { BlurView } from 'expo-blur';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';

interface TranslucentSurfaceProps {
  readonly children: React.ReactNode;
  /** A single radius, or per-corner radii for sheets anchored to an edge. */
  readonly radius?: number;
  readonly topRadius?: number;
  /** Softer blur, for the small map legends. */
  readonly light?: boolean;
  /**
   * The hairline outline the search card carries.
   *
   * Deliberately `hint` at 35%, not the darker contrast fill used elsewhere —
   * over a busy map the card needs a visible edge, not just a tint.
   */
  readonly bordered?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * A blurred, translucent panel floating over the map.
 *
 * Every chrome surface in the app — search card, modal sheet, legends — is one
 * of these, so the map stays readable underneath.
 */
export function TranslucentSurface({
  children,
  radius,
  topRadius,
  light = false,
  bordered = false,
  style,
}: TranslucentSurfaceProps) {
  const theme = useTheme();

  const corners: ViewStyle =
    topRadius === undefined
      ? { borderRadius: radius ?? theme.radii.button }
      : { borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius };

  return (
    <View style={[corners, { overflow: 'hidden' }, style]}>
      <BlurView
        intensity={
          light ? theme.misc.legendBlurIntensity : theme.misc.blurIntensity
        }
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          corners,
          {
            flex: 1,
            backgroundColor: bordered
              ? withAlpha(theme.colors.background, 0.35)
              : theme.colors.translucentBackground,
          },
          bordered
            ? {
                borderWidth: 1.8,
                borderColor: withAlpha(theme.colors.hint, 0.35),
              }
            : {},
        ]}
      >
        {children}
      </View>
    </View>
  );
}
