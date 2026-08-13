import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { TranslationKey } from '@/core/i18n/en';

/** How long a notification stays on screen before dismissing itself. */
const NOTIFICATION_DURATION_MS = 5000;

/** A message shown to the user. */
export interface InAppNotification {
  readonly id: number;
  readonly titleKey: TranslationKey;
  readonly messageKey: TranslationKey;
}

export interface InAppNotificationStore {
  readonly notification: InAppNotification | undefined;
  readonly sendFailure: (failure: Failure) => void;
  readonly dismiss: () => void;
}

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
