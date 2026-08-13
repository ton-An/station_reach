import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { TranslationKey } from '@/core/i18n/en';

const NOTIFICATION_DURATION_MS = 5000;

/**
 * A notification shown to the user, carrying translation keys so the same
 * notification can display in any language.
 */
export interface InAppNotification {
  readonly id: number;
  readonly titleKey: TranslationKey;
  readonly messageKey: TranslationKey;
}

/**
 * Manages the single in-app notification displayed to the user. Failures get
 * converted to notifications with their name and message keys. Notifications
 * dismiss automatically after 5 seconds or when dismissed manually.
 */
export interface InAppNotificationStore {
  readonly notification: InAppNotification | undefined;
  readonly sendFailure: (failure: Failure) => void;
  readonly dismiss: () => void;
}

/**
 * Creates an in-app notification store with auto-dismiss after 5 seconds.
 *
 * @returns A Zustand store that manages the notification state.
 */
export function createInAppNotificationStore(): StoreApi<InAppNotificationStore> {
  let nextId = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return createStore<InAppNotificationStore>()((set) => ({
    notification: undefined,

    sendFailure: (failure) => {
      if (timeout !== undefined) clearTimeout(timeout);

      set({
        notification: {
          id: ++nextId,
          titleKey: failure.nameKey,
          messageKey: failure.messageKey,
        },
      });

      timeout = setTimeout(
        () => set({ notification: undefined }),
        NOTIFICATION_DURATION_MS
      );
    },

    dismiss: () => {
      if (timeout !== undefined) clearTimeout(timeout);
      set({ notification: undefined });
    },
  }));
}
