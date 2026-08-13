import { useStore } from 'zustand';

import { useContainer } from '@/core/container';
import type { InAppNotificationStore } from './in-app-notification-store';

/**
 * Selector hook for the in-app notification store. Components subscribe to
 * only the state they read so changes to other fields do not trigger
 * re-renders.
 *
 * @param selector - A function that picks a value from the store.
 * @returns The selected value from the store.
 */
export function useInAppNotificationStore<T>(
  selector: (store: InAppNotificationStore) => T
): T {
  return useStore(useContainer().inAppNotificationStore, selector);
}
