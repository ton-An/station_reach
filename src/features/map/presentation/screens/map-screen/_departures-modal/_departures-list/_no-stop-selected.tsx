import { Text } from 'react-native';

import { ModalScrollView } from '@/core/components/draggable-modal';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';

/**
 * What the sheet says before anything on the map has been tapped.
 *
 * Still a scrollable body rather than a bare label: it is the sheet's only
 * content at that point, and the sheet is dragged by whatever is inside it.
 */
export function NoStopSelected() {
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
