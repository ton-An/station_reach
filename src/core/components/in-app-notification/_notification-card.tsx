import { useEffect, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/core/i18n/translate';
import type { InAppNotification } from '@/core/notifications/in-app-notification-store';
import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useIsWideLayout } from '@/core/theme/use-is-wide-layout';
import { useTheme } from '@/core/theme/use-theme';
import { FadePressable } from '../fade-pressable';
import { Gap } from '../gap';
import { Icon } from '../icon';
import { pointerEvents } from '../pointer-events';
import { TranslucentSurface } from '../translucent-surface';

const ICON_SIZE = 26;

interface NotificationCardProps {
  readonly notification: InAppNotification;
  readonly onDismiss: () => void;
}

export function NotificationCard({
  notification,
  onDismiss,
}: NotificationCardProps): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isWide = useIsWideLayout();

  const [entryAnimationValue] = useState(() => new Animated.Value(0));

  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    Animated.timing(entryAnimationValue, {
      toValue: 1,
      duration: theme.durations.xxShort,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished) setHasEntered(true);
    });
  }, [entryAnimationValue, theme.durations.xxShort]);

  return (
    <View
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
      <Animated.View
        style={{
          maxWidth: theme.layout.overlayMaxWidth,
          width: '100%',
          ...(hasEntered
            ? {}
            : {
                opacity: entryAnimationValue,
                transform: [
                  {
                    translateY: entryAnimationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-theme.spacing.xxSmall, 0],
                    }),
                  },
                ],
              }),
        }}
      >
        <FadePressable onPress={onDismiss}>
          <TranslucentSurface radius={theme.radii.medium} bordered>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: theme.spacing.xMedium,
                paddingVertical: theme.spacing.medium,
              }}
            >
              <Icon
                name="triangleAlert"
                size={ICON_SIZE}
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
      </Animated.View>
    </View>
  );
}
