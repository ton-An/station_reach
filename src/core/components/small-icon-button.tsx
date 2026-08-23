import { View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';
import { FadePressable } from './fade-pressable';
import { Icon, type IconName } from './icon';

interface SmallIconButtonProps {
  readonly icon: IconName;
  readonly onPress: () => void;
  readonly alignmentOffset?: readonly [number, number];
  readonly backgroundColor?: string;
  readonly accessibilityLabel?: string;
  readonly decorative?: boolean;
}

/**
 * Icon in a filled circle, fading on press through {@link FadePressable}.
 *
 * `decorative` renders the same circle without a `Pressable`: no press
 * fade and no accessibility role, for keeping icons visually balanced
 * where one side has no action.
 *
 * @param alignmentOffset - `[x, y]` pixel nudge for a glyph that renders
 * off-centre in its circle.
 */
export function SmallIconButton({
  icon,
  onPress,
  alignmentOffset = [0, 0],
  backgroundColor,
  accessibilityLabel,
  decorative = false,
}: SmallIconButtonProps): React.JSX.Element {
  const theme = useTheme();

  const circle = (
    <View
      style={{
        padding: theme.spacing.xSmall,
        borderRadius: theme.radii.full,
        backgroundColor:
          backgroundColor ?? theme.colors.translucentBackgroundContrast,
      }}
    >
      <View
        style={{
          transform: [
            { translateX: alignmentOffset[0] },
            { translateY: alignmentOffset[1] },
          ],
        }}
      >
        <Icon name={icon} size={theme.icons.medium} color={theme.colors.text} />
      </View>
    </View>
  );

  if (decorative) return circle;

  return (
    <FadePressable onPress={onPress} accessibilityLabel={accessibilityLabel}>
      {circle}
    </FadePressable>
  );
}
