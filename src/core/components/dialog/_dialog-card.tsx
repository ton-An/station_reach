import {
  Animated,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { useTheme } from '@/core/theme/use-theme';
import { Gap } from '../gap';
import { LinkText } from '../link-text';
import { TranslucentSurface } from '../translucent-surface';
import { DialogActions } from './_dialog-actions';
import type { DialogAction } from './dialog-action';

/** The card's fixed width, matching the Flutter dialog. */
const DIALOG_WIDTH = 320;

/** How much of the screen the scrollable body may occupy. */
const MAX_BODY_FRACTION = 0.55;

/** How much of the background survives as the card's own fill. */
const CARD_TINT_ALPHA = 0.58;

interface DialogCardProps {
  /** The dialog's shared 0..1 entry progress. */
  readonly progress: Animated.Value;
  readonly title: string;
  readonly message: string;
  readonly additionalContent?: React.ReactNode;
  readonly actions: readonly DialogAction[];
}

/**
 * The dialog's blurred card.
 *
 * Scale only — deliberately no opacity fade on the card itself. `backdrop-
 * filter` samples the nearest backdrop root, and an ancestor with opacity below
 * 1 creates one, so fading the card in would leave its blur with nothing to
 * sample until the animation landed on exactly 1 and the blur would visibly
 * arrive a beat late. The scrim behind it carries the fade instead.
 */
export function DialogCard({
  progress,
  title,
  message,
  additionalContent,
  actions,
}: DialogCardProps): React.JSX.Element {
  const theme = useTheme();
  const { height } = useWindowDimensions();

  return (
    <Animated.View
      style={{
        pointerEvents: 'auto',
        transform: [
          {
            // Settles down from slightly oversized rather than growing in.
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1.15, 1],
            }),
          },
        ],
      }}
    >
      <TranslucentSurface
        radius={theme.radii.xMedium}
        tint={withAlpha(theme.colors.background, CARD_TINT_ALPHA)}
        style={{ width: DIALOG_WIDTH }}
      >
        <View style={{ padding: theme.spacing.medium + theme.spacing.xTiny }}>
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
                <Gap size="xMedium" axis="vertical" />
                {additionalContent}
              </>
            )}
          </ScrollView>

          <Gap size="xMedium" axis="vertical" />

          <DialogActions actions={actions} />
        </View>
      </TranslucentSurface>
    </Animated.View>
  );
}
