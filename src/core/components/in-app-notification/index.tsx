import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';
import { NotificationCard } from './_notification-card';

/**
 * Renders the {@link InAppNotificationStore}'s current notification as a
 * {@link NotificationCard}, or nothing when there isn't one. Mounted once at
 * the app root — every failure in the app surfaces through here.
 */
export function InAppNotificationListener(): React.JSX.Element | null {
  const notification = useInAppNotificationStore((store) => store.notification);
  const dismiss = useInAppNotificationStore((store) => store.dismiss);

  if (notification === undefined) return null;

  return (
    <NotificationCard
      key={notification.id}
      notification={notification}
      onDismiss={dismiss}
    />
  );
}
