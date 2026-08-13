import { Fragment } from 'react';
import { View } from 'react-native';

import { Gap } from '../gap';
import { DialogButton } from './_dialog-button';
import type { DialogAction } from './dialog-action';

interface DialogActionsProps {
  readonly actions: readonly DialogAction[];
}

export function DialogActions({
  actions,
}: DialogActionsProps): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row' }}>
      {actions.map((action, index) => (
        <Fragment key={action.label}>
          {index > 0 && <Gap size="xxSmall" />}

          <View style={{ flex: 1 }}>
            <DialogButton action={action} />
          </View>
        </Fragment>
      ))}
    </View>
  );
}
