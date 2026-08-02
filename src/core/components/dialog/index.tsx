import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { withAlpha } from '@/core/helpers/color-helper';
import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';
import { Gap } from '../gap';
import { LinkText } from '../link-text';
import { TranslucentSurface } from '../translucent-surface';
import { DialogButton } from './_dialog-button';
import type { DialogAction } from './dialog-action';

export type { DialogAction };

/** The card's fixed width, matching the Flutter dialog. */
const DIALOG_WIDTH = 320;

/** How much of the screen the scrollable body may occupy. */
const MAX_BODY_FRACTION = 0.55;

/** The dimming behind the card — light, because the card is itself blurred. */
const SCRIM_OPACITY = 0.18;

interface DialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  /** Prose. Bare URLs inside it become underlined links. */
  readonly message: string;
  /** Rendered below the message, e.g. the open-source card. */
  readonly additionalContent?: React.ReactNode;
  readonly actions: readonly DialogAction[];
}

/**
 * The app's modal dialog.
 *
 * A blurred, translucent card rather than an opaque sheet — it sits over the
 * map and lets it read through, the same way every other surface does. Scales
 * down slightly as it appears.
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  additionalContent,
  actions,
}: DialogProps) {
  const theme = useTheme();
  const { height } = useWindowDimensions();

  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: theme.durations.short,
      easing: isOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [isOpen, progress, theme.durations.short]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {/* Tapping anywhere outside the card dismisses it. */}
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              opacity: progress,
              backgroundColor: withAlpha(
                theme.colors.backgroundContrast,
                SCRIM_OPACITY
              ),
            }}
          />
        </Pressable>

        {/* The gap around the card must fall through to the scrim behind it. */}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Animated.View
            style={{
              pointerEvents: 'auto',
              opacity: progress,
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
              tint={withAlpha(theme.colors.background, 0.58)}
              style={{ width: DIALOG_WIDTH }}
            >
              <View
                style={{ padding: theme.spacing.medium + theme.spacing.xTiny }}
              >
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

                <View style={{ flexDirection: 'row' }}>
                  {actions.map((action, index) => (
                    <View
                      key={action.label}
                      style={{
                        flex: 1,
                        marginLeft: index === 0 ? 0 : theme.spacing.xxSmall,
                      }}
                    >
                      <DialogButton action={action} />
                    </View>
                  ))}
                </View>
              </View>
            </TranslucentSurface>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
