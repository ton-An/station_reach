import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { TranslationKey } from '@/core/i18n/en';

/** How long a notification stays on screen before dismissing itself. */
const NOTIFICATION_DURATION_MS = 5000;

/**
 * A message shown over the map.
 *
 * Carries translation keys, not copy — the component that renders it is what
 * resolves them, so nothing below the UI holds a user-facing sentence.
 */
export interface InAppNotification {
  readonly id: number;
  readonly titleKey: TranslationKey;
  readonly messageKey: TranslationKey;
}

export interface InAppNotificationStore {
  readonly notification: InAppNotification | undefined;
  /**
   * Surfaces a failure to the user.
   *
   * Every failure in the app reaches the user through here — screens do not
   * render their own error banners.
   */
  readonly sendFailure: (failure: Failure) => void;
  readonly dismiss: () => void;
}

/** Builds the notification store. It has no dependencies of its own. */
export function createInAppNotificationStore(): StoreApi<InAppNotificationStore> {
  let nextId = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return createStore<InAppNotificationStore>()((set) => ({
    notification: undefined,

    sendFailure: (failure) => {
      // A newer failure replaces the current one outright, so the timer that
      // belonged to it has to go with it.
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
