import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, View } from 'react-native';

import { USE_NATIVE_DRIVER } from '@/core/theme/animation';
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
 * together while `isOpen` becomes true.
 *
 * Tapping the scrim, or the Android back button, calls `onClose`. An action
 * in `actions` does not close the dialog unless its own `onPress` calls
 * `onClose` too.
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

  const [entryAnimationValue] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!isOpen) return;

    entryAnimationValue.setValue(0);

    const entry = Animated.timing(entryAnimationValue, {
      toValue: 1,
      duration: theme.durations.short,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    });

    entry.start();

    return () => entry.stop();
  }, [isOpen, entryAnimationValue, theme.durations.short]);

  return (
    <Modal
      visible={isOpen}
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
