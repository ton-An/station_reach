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
 * The blur material every surface is cut from.
 *
 * iOS 26 draws nothing at all for the legacy `light` effect, and nothing for
 * `systemUltraThinMaterialLight` either — the surface keeps its tint and the
 * map stays pin-sharp underneath. `systemThinMaterialLight` is the thinnest
 * one that still blurs there.
 *
 * Everywhere else `light` stays: `tint` picks the fill laid under the blur as
 * well as the blur itself, and the system materials are grey where `light` is
 * white, which would dull the chrome on the web.
 */
const BLUR_TINT: BlurTint = Platform.select({
  ios: 'systemThinMaterialLight',
  default: 'light',
});

const BORDER_WIDTH = 1.8;
const BORDER_ALPHA = 0.35;

/** How much background a bordered surface lays over the blur. */
const BORDERED_FILL_ALPHA = 0.35;

interface TranslucentSurfaceProps {
  readonly children: React.ReactNode;
  /** A single radius, or per-corner radii for sheets anchored to an edge. */
  readonly radius?: number;
  readonly topRadius?: number;
  /** Softer blur, for the small map legends. */
  readonly light?: boolean;
  /**
   * Adds a hairline outline.
   *
   * Deliberately `hint` at 35%, not the darker contrast fill used elsewhere —
   * over a busy map a surface needs a visible edge, not just a tint.
   */
  readonly bordered?: boolean;
  /** Overrides the fill laid over the blur, for surfaces with their own tint. */
  readonly tint?: string;
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
  tint,
  style,
}: TranslucentSurfaceProps): React.JSX.Element {
  const theme = useTheme();
  const window = useWindowDimensions();

  const corners: ViewStyle =
    topRadius === undefined
      ? { borderRadius: radius ?? theme.radii.button }
      : { borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius };

  return (
    <View style={[corners, { overflow: 'hidden' }, style]}>
      {/*
        Sized from the window rather than stretched to fill.

        A `UIVisualEffectView` that is *resized* after it is created renders
        nothing at all — no blur, just its tint — and the sheet's animated
        height resizes it on every frame of a drag. Nothing is ever taller
        than the window and the wrapper above clips, so an oversized layer of
        a fixed height paints the same picture without ever resizing.
      */}
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
            // `flexGrow`, not `flex`: the latter zeroes the flex basis, so in a
            // surface left to size itself — the search card — the fill would
            // measure as nothing and collapse the card to its border.
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
                borderColor: withAlpha(theme.colors.hint, BORDER_ALPHA),
              }
            : {},
        ]}
      >
        {children}
      </View>
    </View>
  );
}
