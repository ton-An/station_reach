import { useState } from 'react';
import { View } from 'react-native';

import { Dialog } from '@/core/components/dialog';
import { FadePressable } from '@/core/components/fade-pressable';
import { Icon } from '@/core/components/icon';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';

import { AttributionOpenSourceCard } from './_attribution-open-source-card';
import { attributionMessage } from './attributions';

/**
 * Button that opens the map's legal attributions.
 *
 * OpenStreetMap, CartoDB, Transitous and the site's privacy policy and
 * impressum are legal requirements, and this dialog is the one place the
 * app shows them.
 *
 * Sub-components:
 * - {@link AttributionOpenSourceCard}: link to the project's repository
 */
export function AttributionLegend(): React.JSX.Element {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TranslucentSurface radius={theme.radii.small} light>
        <FadePressable
          onPress={() => setIsOpen(true)}
          accessibilityLabel={t('attributions')}
        >
          <View
            style={{
              width: theme.layout.legendHeight,
              height: theme.layout.legendHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              name="info"
              size={theme.icons.medium}
              color={theme.colors.hint}
            />
          </View>
        </FadePressable>
      </TranslucentSurface>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('attributions')}
        message={attributionMessage()}
        additionalContent={<AttributionOpenSourceCard />}
        actions={[{ label: t('ok'), onPress: () => setIsOpen(false) }]}
      />
    </>
  );
}
