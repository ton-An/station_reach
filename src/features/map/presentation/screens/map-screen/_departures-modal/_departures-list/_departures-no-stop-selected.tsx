import { Text } from 'react-native';

import { ModalScrollView } from '@/core/components/draggable-modal';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';

/**
 * Placeholder message shown when no station is selected.
 */
export function DeparturesNoStopSelected(): React.JSX.Element {
  const theme = useTheme();

  return (
    <ModalScrollView
      contentContainerStyle={{ paddingTop: theme.spacing.xMedium }}
    >
      <Text
        style={[
          theme.text.body,
          { color: theme.colors.hint, textAlign: 'center' },
        ]}
      >
        {t('noStopSelected')}
      </Text>
    </ModalScrollView>
  );
}
