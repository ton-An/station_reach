import { BlurView, type BlurTint } from 'expo-blur';
import {
  Platform,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';

/**
 * iOS gets the system thin-material blur; other platforms fall back to a
 * flat light tint.
 */
const BLUR_TINT: BlurTint = Platform.select({
  ios: 'systemThinMaterialLight',
  default: 'light',
});

/**
 * Contact layer plus ambient layer: one tight and faint at the edge, one
 * wide and fainter below. A single mid-blur layer reads as a grey ring
 * around the surface instead of as depth.
 */
const SHADOW_LAYERS = [
  { offsetY: 1, blurRadius: 2, alpha: 0.06 },
  { offsetY: 10, blurRadius: 28, alpha: 0.02 },
] as const;

interface TranslucentSurfaceProps {
  readonly children: React.ReactNode;
  readonly radius?: number;
  readonly topRadius?: number;
  readonly light?: boolean;
  readonly tint?: string;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * Blurred, tinted background panel: floating chrome sits on this instead
 * of an opaque fill.
 *
 * `topRadius` rounds only the top corners, for panels pinned to an edge;
 * without it, `radius` (or the panel default) rounds all four.
 * `light` selects the lower-intensity blur used behind the legend, and
 * `tint` overrides the fill outright.
 *
 * A soft drop shadow separates the surface from whatever it floats over:
 * the fill alone disappears against a pale map.
 *
 * The blur layer is sized to the window rather than measured, relying on
 * the outer view's clipping to crop it.
 */
export function TranslucentSurface({
  children,
  radius,
  topRadius,
  light = false,
  tint,
  style,
}: TranslucentSurfaceProps): React.JSX.Element {
  const theme = useTheme();
  const window = useWindowDimensions();

  const corners: ViewStyle =
    topRadius === undefined
      ? { borderRadius: radius ?? theme.radii.xMedium }
      : { borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius };

  return (
    <View
      style={[
        corners,
        {
          overflow: 'hidden',
          boxShadow: SHADOW_LAYERS.map(
            ({ offsetY, blurRadius, alpha }) =>
              `0px ${offsetY}px ${blurRadius}px ${withAlpha(
                theme.colors.backgroundContrast,
                alpha
              )}`
          ).join(', '),
        },
        style,
      ]}
    >
      <BlurView
        intensity={
          light ? theme.misc.legendBlurIntensity : theme.misc.blurIntensity
        }
        tint={BLUR_TINT}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: window.height,
        }}
      />

      <View
        style={[
          corners,
          {
            // Shrinks as well as grows: without it the fill layer keeps its
            // content height, and a scrollable child of the surface is then
            // laid out at its full content height and never scrolls.
            flexGrow: 1,
            flexShrink: 1,
            backgroundColor: tint ?? theme.colors.translucentBackground,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
