import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';
import { Gap } from '../gap';
import { LinkText } from '../link-text';
import { TranslucentSurface } from '../translucent-surface';
import { DialogActions } from './_dialog-actions';
import type { DialogAction } from './dialog-action';

const DIALOG_WIDTH = 320;

const MAX_BODY_FRACTION = 0.55;

const CARD_TINT_ALPHA = 0.58;

const ENTRY_SCALE = 1.15;

interface DialogCardProps {
  readonly entryAnimationValue: SharedValue<number>;
  readonly title: string;
  readonly message: string;
  readonly additionalContent?: React.ReactNode;
  readonly actions: readonly DialogAction[];
}

/**
 * Dialog content: title, a scrollable message, optional extra content and
 * the action row. Scales and fades with `entryAnimationValue`, so the card
 * shrinks into place as the dialog opens and grows back out as it closes.
 */
export function DialogCard({
  entryAnimationValue,
  title,
  message,
  additionalContent,
  actions,
}: DialogCardProps): React.JSX.Element {
  const theme = useTheme();
  const { height } = useWindowDimensions();

  const entryStyle = useAnimatedStyle(() => ({
    opacity: entryAnimationValue.value,
    transform: [
      {
        scale: interpolate(entryAnimationValue.value, [0, 1], [ENTRY_SCALE, 1]),
      },
    ],
  }));

  return (
    <Animated.View style={[entryStyle, { pointerEvents: 'auto' }]}>
      <TranslucentSurface
        radius={theme.radii.xMedium}
        tint={withAlpha(theme.colors.background, CARD_TINT_ALPHA)}
        style={{ width: DIALOG_WIDTH }}
      >
        <View style={{ padding: theme.spacing.xMedium }}>
          <Gap size="small" axis="vertical" />

          <Text
            style={[
              theme.text.title2,
              { color: theme.colors.text, fontWeight: '600' },
            ]}
          >
            {title}
          </Text>

          <Gap size="xxSmall" axis="vertical" />

          <ScrollView style={{ maxHeight: height * MAX_BODY_FRACTION }}>
            <LinkText text={message} />

            {additionalContent !== undefined && (
              <>
                <Gap size="large" axis="vertical" />
                {additionalContent}
              </>
            )}
          </ScrollView>

          <Gap size="large" axis="vertical" />

          <DialogActions actions={actions} />
        </View>
      </TranslucentSurface>
    </Animated.View>
  );
}
