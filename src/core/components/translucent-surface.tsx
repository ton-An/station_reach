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

const BLUR_TINT: BlurTint = Platform.select({
  ios: 'systemThinMaterialLight',
  default: 'light',
});

const BORDER_WIDTH = 1.8;
const BORDER_ALPHA = 0.35;

const BORDERED_FILL_ALPHA = 0.35;

interface TranslucentSurfaceProps {
  readonly children: React.ReactNode;
  /** A single radius, or per-corner radii for a sheet anchored to an edge. */
  readonly radius?: number;
  readonly topRadius?: number;
  /** Softer blur, for the small map legends. */
  readonly light?: boolean;
  /** Adds a hairline outline. */
  readonly bordered?: boolean;
  /** Overrides the fill laid over the blur. */
  readonly tint?: string;
  readonly style?: StyleProp<ViewStyle>;
}

/** A blurred, translucent panel floating over the map. */
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
