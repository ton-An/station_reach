import { useState } from 'react';
import { View } from 'react-native';

import { Dialog } from '@/core/components/dialog';
import { FadePressable } from '@/core/components/fade-pressable';
import { Icon } from '@/core/components/icon';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import { OpenSourceCard } from './_open-source-card';
import { attributionMessage } from './attributions';

/**
 * The small info button that opens the attributions.
 *
 * ! The icon may stay small, but it must stay present and reachable — the
 * licences behind it require the credits to be available wherever the map is.
 */
export function AttributionLegend() {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TranslucentSurface radius={theme.radii.small} light>
        <FadePressable
          onPress={() => setIsOpen(true)}
          accessibilityLabel={t('attributions')}
        >
          <View style={{ padding: theme.spacing.xxSmall }}>
            <Icon name="info" size={24} color={theme.colors.description} />
          </View>
        </FadePressable>
      </TranslucentSurface>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('attributions')}
        message={attributionMessage()}
        additionalContent={<OpenSourceCard />}
        actions={[{ label: t('ok'), onPress: () => setIsOpen(false) }]}
      />
    </>
  );
}
