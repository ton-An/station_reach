import { Text, View } from 'react-native';
import Animated, {
  Easing,
  withTiming,
  type EntryExitAnimationFunction,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/core/i18n/translate';
import type { InAppNotification } from '@/core/notifications/in-app-notification-store';
import { useIsWideLayout } from '@/core/theme/use-is-wide-layout';
import { useTheme } from '@/core/theme/use-theme';
import { FadePressable } from '../fade-pressable';
import { Gap } from '../gap';
import { Icon } from '../icon';
import { pointerEvents } from '../pointer-events';
import { TranslucentSurface } from '../translucent-surface';

interface NotificationCardProps {
  readonly notification: InAppNotification;
  readonly onDismiss: () => void;
}

/**
 * One notification, dropping in from above the top of the screen and
 * lifting back out. Tapping anywhere on it calls `onDismiss`.
 *
 * The exit is a layout animation rather than an animated style, so the card
 * keeps playing after the store has already dropped it and nothing has to
 * hold a copy of a notification that is gone.
 */
export function NotificationCard({
  notification,
  onDismiss,
}: NotificationCardProps): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isWide = useIsWideLayout();

  const travel = theme.spacing.xxSmall;

  const entering: EntryExitAnimationFunction = () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: -travel }] },
      animations: {
        opacity: withTiming(1, {
          duration: theme.durations.xxShort,
          easing: Easing.out(Easing.cubic),
        }),
        transform: [
          {
            translateY: withTiming(0, {
              duration: theme.durations.xxShort,
              easing: Easing.out(Easing.cubic),
            }),
          },
        ],
      },
    };
  };

  const exiting: EntryExitAnimationFunction = () => {
    'worklet';
    return {
      initialValues: { opacity: 1, transform: [{ translateY: 0 }] },
      animations: {
        opacity: withTiming(0, {
          duration: theme.durations.xxTiny,
          easing: Easing.in(Easing.cubic),
        }),
        transform: [
          {
            translateY: withTiming(-travel, {
              duration: theme.durations.xxTiny,
              easing: Easing.in(Easing.cubic),
            }),
          },
        ],
      },
    };
  };

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={[
        pointerEvents.passThrough,
        {
          position: 'absolute',
          top: insets.top + theme.spacing.medium,
          left: theme.spacing.medium,
          right: theme.spacing.medium,
          alignItems: isWide ? 'flex-end' : 'center',
        },
      ]}
    >
      <View
        style={{
          maxWidth: theme.layout.overlayMaxWidth,
          width: '100%',
        }}
      >
        <FadePressable onPress={onDismiss}>
          <TranslucentSurface radius={theme.radii.medium} bordered>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: theme.spacing.large,
                paddingVertical: theme.spacing.medium,
              }}
            >
              <Icon
                name="triangleAlert"
                size={theme.icons.medium}
                color={theme.colors.error}
              />

              <Gap size="medium" />

              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={[theme.text.headline, { color: theme.colors.error }]}
                >
                  {t(notification.titleKey)}
                </Text>

                <Gap size="tiny" axis="vertical" />

                <Text style={[theme.text.body, { color: theme.colors.text }]}>
                  {t(notification.messageKey)}
                </Text>
              </View>
            </View>
          </TranslucentSurface>
        </FadePressable>
      </View>
    </Animated.View>
  );
}
