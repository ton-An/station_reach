import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInAppNotificationStore } from '@/core/notifications/in-app-notification-store';
import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { useTheme } from '@/core/theme/use-theme';
import { FadePressable } from './fade-pressable';
import { TranslucentSurface } from './translucent-surface';

/**
 * Renders the current in-app notification, if any.
 *
 * Mounted once above the whole app — this is the only place failures become
 * visible, so screens never grow their own error banners.
 */
export function InAppNotificationListener() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const notification = useInAppNotificationStore((store) => store.notification);
  const dismiss = useInAppNotificationStore((store) => store.dismiss);

  const [slide] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(slide, {
      toValue: notification === undefined ? 0 : 1,
      duration: theme.durations.xxShort,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [notification, slide, theme.durations.xxShort]);

  if (notification === undefined) return null;

  return (
    <Animated.View
      style={{
        pointerEvents: 'box-none',
        position: 'absolute',
        left: theme.spacing.medium,
        right: theme.spacing.medium,
        bottom: insets.bottom + theme.spacing.medium,
        alignItems: 'center',
        opacity: slide,
        transform: [
          {
            translateY: slide.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            }),
          },
        ],
      }}
    >
      <FadePressable onPress={dismiss} style={{ maxWidth: 400, width: '100%' }}>
        <TranslucentSurface radius={theme.radii.medium} bordered>
          <View style={{ padding: theme.spacing.medium }}>
            <Text style={[theme.text.headline, { color: theme.colors.error }]}>
              {notification.title}
            </Text>

            <Text
              style={[
                theme.text.subhead,
                { color: theme.colors.text, marginTop: theme.spacing.small },
              ]}
            >
              {notification.message}
            </Text>
          </View>
        </TranslucentSurface>
      </FadePressable>
    </Animated.View>
  );
}
