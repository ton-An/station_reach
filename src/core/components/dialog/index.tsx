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
  /** Prose. Bare URLs inside it become underlined links. */
  readonly message: string;
  /** Rendered below the message. */
  readonly additionalContent?: React.ReactNode;
  readonly actions: readonly DialogAction[];
}

/** The app's modal dialog. */
export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  additionalContent,
  actions,
}: DialogProps): React.JSX.Element {
  const theme = useTheme();

  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!isOpen) return;

    progress.setValue(0);

    const entry = Animated.timing(progress, {
      toValue: 1,
      duration: theme.durations.short,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    });

    entry.start();

    return () => entry.stop();
  }, [isOpen, progress, theme.durations.short]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <DialogScrim progress={progress} onPress={onClose} />

        <View
          style={[
            pointerEvents.passThrough,
            { flex: 1, alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <DialogCard
            progress={progress}
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
