import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';
import { NotificationCard } from './_notification-card';

/**
 * Renders the current in-app notification, if any.
 *
 * Mounted once above the whole app — this is the only place failures become
 * visible, so screens never grow their own error banners.
 */
export function InAppNotificationListener(): React.JSX.Element | null {
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
