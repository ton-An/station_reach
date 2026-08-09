import { useStore } from 'zustand';

import { useContainer } from '@/core/container';
import type { InAppNotificationStore } from './in-app-notification-store';

/**
 * Subscribes to the in-app notification store.
 *
 * Lives apart from the store itself so that the store never has to import the
 * container that constructs it.
 */
export function useInAppNotificationStore<T>(
  selector: (store: InAppNotificationStore) => T
): T {
  return useStore(useContainer().inAppNotificationStore, selector);
}
