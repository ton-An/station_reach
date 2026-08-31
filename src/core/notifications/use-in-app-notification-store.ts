import { useStore } from 'zustand';

import { useContainer } from '@/core/container';

import type { InAppNotificationStore } from './in-app-notification-store';

export function useInAppNotificationStore<T>(
  selector: (store: InAppNotificationStore) => T
): T {
  return useStore(useContainer().inAppNotificationStore, selector);
}
