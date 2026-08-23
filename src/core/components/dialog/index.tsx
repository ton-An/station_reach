import { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import {
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/core/theme/use-theme';
import { pointerEvents } from '../pointer-events';
import { DialogCard } from './_dialog-card';
import { DialogScrim } from './_dialog-scrim';
import type { DialogAction } from './dialog-action';

export type { DialogAction };

interface DialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly message: string;
  readonly additionalContent?: React.ReactNode;
  readonly actions: readonly DialogAction[];
}

/**
 * Modal dialog: a centred card over a translucent scrim, both animating in
 * together while `isOpen` becomes true and back out when it clears.
 *
 * Tapping the scrim, or the Android back button, calls `onClose`. An action
 * in `actions` does not close the dialog unless its own `onPress` calls
 * `onClose` too.
 *
 * A closing dialog outlives `isOpen`. `Modal` tears its window down the
 * frame `visible` clears, taking the exit animation with it, so the window
 * stays up until the animation itself reports it has nothing left to show.
 *
 * Sub-components:
 * - {@link DialogScrim}: the backdrop, dismisses on tap
 * - {@link DialogCard}: title, message, optional extra content and actions
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  additionalContent,
  actions,
}: DialogProps): React.JSX.Element {
  const theme = useTheme();

  const entryAnimationValue = useSharedValue(0);
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    entryAnimationValue.value = isOpen
      ? withTiming(1, {
          duration: theme.durations.short,
          easing: Easing.out(Easing.cubic),
        })
      : withTiming(0, {
          duration: theme.durations.xxTiny,
          easing: Easing.in(Easing.cubic),
        });
  }, [
    isOpen,
    entryAnimationValue,
    theme.durations.short,
    theme.durations.xxTiny,
  ]);

  useAnimatedReaction(
    () => entryAnimationValue.value > 0,
    (isVisible, wasVisible) => {
      if (isVisible !== wasVisible) scheduleOnRN(setIsOnScreen, isVisible);
    }
  );

  return (
    <Modal
      visible={isOpen || isOnScreen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <DialogScrim
          entryAnimationValue={entryAnimationValue}
          onPress={onClose}
        />

        <View
          style={[
            pointerEvents.passThrough,
            { flex: 1, alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <DialogCard
            entryAnimationValue={entryAnimationValue}
            title={title}
            message={message}
            additionalContent={additionalContent}
            actions={actions}
          />
        </View>
      </View>
    </Modal>
  );
}
