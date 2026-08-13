import { useInAppNotificationStore } from '@/core/notifications/use-in-app-notification-store';
import { NotificationCard } from './_notification-card';

/**
 * Listens for in-app notifications and renders them.
 *
 * Subscribes to the notification store and renders the current notification
 * when present.
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
