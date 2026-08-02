import { create } from 'zustand';

import type { Failure } from '../failures/failure';

/** How long a notification stays on screen before dismissing itself. */
export const NOTIFICATION_DURATION_MS = 5000;

export interface InAppNotification {
  readonly id: number;
  readonly title: string;
  readonly message: string;
}

interface InAppNotificationStore {
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

let nextId = 0;

export const useInAppNotificationStore = create<InAppNotificationStore>()(
  (set, get) => ({
    notification: undefined,

    sendFailure: (failure) => {
      const id = ++nextId;

      set({
        notification: { id, title: failure.name, message: failure.message },
      });

      setTimeout(() => {
        // Only dismiss if a newer notification hasn't replaced this one.
        if (get().notification?.id === id) set({ notification: undefined });
      }, NOTIFICATION_DURATION_MS);
    },

    dismiss: () => set({ notification: undefined }),
  })
);
