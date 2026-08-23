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

const BORDER_WIDTH = 1.8;
const BORDER_ALPHA = 0.35;

const BORDERED_FILL_ALPHA = 0.35;

interface TranslucentSurfaceProps {
  readonly children: React.ReactNode;
  readonly radius?: number;
  readonly topRadius?: number;
  readonly light?: boolean;
  readonly bordered?: boolean;
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
 * `bordered` swaps the fill for a translucent tint of `background` plus a
 * hairline border. `tint` overrides the fill outright.
 *
 * The blur layer is sized to the window rather than measured, relying on
 * the outer view's clipping to crop it to the surface's real bounds
 * instead of waiting a frame on layout.
 */
export function TranslucentSurface({
  children,
  radius,
  topRadius,
  light = false,
  bordered = false,
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
    <View style={[corners, { overflow: 'hidden' }, style]}>
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
            flexGrow: 1,
            backgroundColor:
              tint ??
              (bordered
                ? withAlpha(theme.colors.background, BORDERED_FILL_ALPHA)
                : theme.colors.translucentBackground),
          },
          bordered
            ? {
                borderWidth: BORDER_WIDTH,
                borderColor: withAlpha(theme.colors.border, BORDER_ALPHA),
              }
            : {},
        ]}
      >
        {children}
      </View>
    </View>
  );
}
