import { createStore, type StoreApi } from 'zustand/vanilla';

import type { Failure } from '@/core/failures';
import type { TranslationKey } from '@/core/i18n/en';

const NOTIFICATION_DURATION_MS = 5000;

export interface InAppNotification {
  /**
   * Distinct per send, so a repeated failure still remounts and
   * re-animates.
   */
  readonly id: number;
  readonly titleKey: TranslationKey;
  readonly messageKey: TranslationKey;
}

export interface InAppNotificationStore {
  readonly notification: InAppNotification | undefined;
  readonly sendFailure: (failure: Failure) => void;
  readonly dismiss: () => void;
}

/**
 * Holds the one failure notification on screen — the single path a
 * {@link Failure} takes from anywhere in the app to the user.
 *
 * Sending a new failure replaces whatever is showing and restarts the
 * auto-dismiss timer.
 *
 * States:
 * - `notification` undefined: nothing to show
 * - `notification` set: on screen, dismissing itself after
 *   {@link NOTIFICATION_DURATION_MS} unless dismissed sooner
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
