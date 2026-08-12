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
  /** Rendered below the message, e.g. the open-source card. */
  readonly additionalContent?: React.ReactNode;
  readonly actions: readonly DialogAction[];
}

/**
 * The app's modal dialog.
 *
 * A blurred, translucent card rather than an opaque sheet — it sits over the
 * map and lets it read through, the same way every other surface does. Scales
 * down slightly as it appears; the scrim behind it carries the fade.
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  additionalContent,
  actions,
}: DialogProps) {
  const theme = useTheme();

  const [progress] = useState(() => new Animated.Value(0));

  /*
    Replays from the start on every open.

    The card is unmounted by `Modal` the instant it closes, so there is no exit
    to animate — and animating back down to 0 on close only worked if that
    animation actually got to finish. Anything that interrupted it left the
    value stranded, and every later open rendered at its final frame with no
    motion at all. Setting the value explicitly makes each open independent of
    whatever the last one left behind.
  */
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

        {/* The gap around the card must fall through to the scrim behind it. */}
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
