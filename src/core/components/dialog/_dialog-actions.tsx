import { View } from 'react-native';

import { useTheme } from '@/core/theme/use-theme';
import { DialogButton } from './_dialog-button';
import type { DialogAction } from './dialog-action';

interface DialogActionsProps {
  readonly actions: readonly DialogAction[];
}

/** The dialog's buttons, sharing the width evenly. */
export function DialogActions({ actions }: DialogActionsProps) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row' }}>
      {actions.map((action, index) => (
        <View
          key={action.label}
          style={{
            flex: 1,
            marginLeft: index === 0 ? 0 : theme.spacing.xxSmall,
          }}
        >
          <DialogButton action={action} />
        </View>
      ))}
    </View>
  );
}
