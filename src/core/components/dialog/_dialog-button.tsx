import { Text, View } from 'react-native';

import { FadePressable } from '@/core/components/fade-pressable';
import { useTheme } from '@/core/theme/use-theme';
import type { DialogAction } from './dialog-action';

interface DialogButtonProps {
  readonly action: DialogAction;
}

export function DialogButton({ action }: DialogButtonProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <FadePressable onPress={action.onPress} accessibilityLabel={action.label}>
      <View
        style={{
          paddingVertical: theme.spacing.medium,
          borderRadius: theme.radii.small,
          backgroundColor: theme.colors.translucentBackgroundContrast,
          alignItems: 'center',
        }}
      >
        <Text
          style={[
            theme.text.body,
            {
              fontWeight: '600',
              color:
                action.highlight === true
                  ? theme.colors.error
                  : theme.colors.text,
            },
          ]}
        >
          {action.label}
        </Text>
      </View>
    </FadePressable>
  );
}
