import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/core/i18n/translate';
import type { InAppNotification } from '@/core/notifications/in-app-notification-store';
import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';
import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
import { spacing, WIDE_LAYOUT_BREAKPOINT } from '@/core/theme/theme';
import { useTheme } from '@/core/theme/use-theme';
import { FadePressable } from './fade-pressable';
import { Gap } from './gap';
import { Icon } from './icon';
import { pointerEvents } from './pointer-events';
import { TranslucentSurface } from './translucent-surface';

/** Widest the card grows, matching the rest of the floating chrome. */
const MAX_WIDTH = 400;

/** The warning glyph beside the message. */
const ICON_SIZE = 26;

/**
 * How far above its resting place the card starts, in pixels.
 *
 * Kept below the top offset so the card never begins life clipped by the edge
 * of the screen — on web the safe-area inset is zero, so there is nothing else
 * holding it down.
 */
const ENTRY_TRAVEL = spacing.xxSmall;

/**
 * Renders the current in-app notification, if any.
 *
 * Mounted once above the whole app — this is the only place failures become
 * visible, so screens never grow their own error banners.
 */
export function InAppNotificationListener() {
  const notification = useInAppNotificationStore((store) => store.notification);
  const dismiss = useInAppNotificationStore((store) => store.dismiss);

  if (notification === undefined) return null;

  /*
    Keyed by id, so each notification gets a fresh card rather than new text in
    the old one. That is what replays the entry animation when a second failure
    lands while the first is still up — no resetting by hand.
  */
  return (
    <NotificationCard
      key={notification.id}
      notification={notification}
      onDismiss={dismiss}
    />
  );
}

interface NotificationCardProps {
  readonly notification: InAppNotification;
  readonly onDismiss: () => void;
}

/**
 * One notification, animating in on mount.
 *
 * It hangs from the top right, dropping in from just above its resting place,
 * because the bottom of the screen already belongs to the departures sheet. On
 * a narrow screen it spans the width instead, since there is no room to sit
 * beside anything.
 */
function NotificationCard({ notification, onDismiss }: NotificationCardProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [entry] = useState(() => new Animated.Value(0));

  /*
    Whether the card has finished arriving.

    ! Load-bearing, not cosmetic. `opacity` and `transform` each make their
    element a backdrop root, and a backdrop root has nothing behind it to
    blur — so while either sits on this wrapper the surface inside it renders
    flat. Both are dropped the moment the entry animation lands, which is when
    the card is actually looked at.
  */
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    Animated.timing(entry, {
      toValue: 1,
      duration: theme.durations.xxShort,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished) setHasEntered(true);
    });
  }, [entry, theme.durations.xxShort]);

  const isWide = width >= WIDE_LAYOUT_BREAKPOINT;

  // The bar spans the screen but only the card is chrome — the rest of it
  // stays transparent to input, or it would swallow map clicks across the full
  // width for as long as the notification shows.
  return (
    <View
      style={[
        pointerEvents.passThrough,
        {
          position: 'absolute',
          // Level with the search field, so the two read as one row of chrome.
          top: insets.top + theme.spacing.medium,
          left: theme.spacing.medium,
          right: theme.spacing.medium,
          alignItems: isWide ? 'flex-end' : 'center',
        },
      ]}
    >
      <Animated.View
        style={{
          maxWidth: MAX_WIDTH,
          width: '100%',
          // See `hasEntered` — leaving these on would cost the card its blur.
          ...(hasEntered
            ? {}
            : {
                opacity: entry,
                transform: [
                  {
                    translateY: entry.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-ENTRY_TRAVEL, 0],
                    }),
                  },
                ],
              }),
        }}
      >
        <FadePressable onPress={onDismiss}>
          {/* Bordered, unlike the Flutter original: that one sat over raster
              tiles dark enough to frame it, and over this basemap a card with
              no edge dissolves into the map. */}
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

              {/* Takes the remaining width so a long name ellipsises rather
                  than pushing the icon out of the card. */}
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
