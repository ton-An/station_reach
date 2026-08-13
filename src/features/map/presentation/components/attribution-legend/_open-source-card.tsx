import * as WebBrowser from 'expo-web-browser';
import { Text, View } from 'react-native';

import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { GradientBorder } from '@/core/components/gradient-border';
import { Icon } from '@/core/components/icon';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import { REPOSITORY_URL } from './attributions';

/**
 * Card linking to the Station Reach GitHub repository.
 */
export function OpenSourceCard(): React.JSX.Element {
  const theme = useTheme();

  return (
    <FadePressable
      onPress={() => void WebBrowser.openBrowserAsync(REPOSITORY_URL)}
      accessibilityLabel={t('proudlyOpenSource')}
    >
      <GradientBorder
        colors={theme.colors.timelineGradient}
        radius={theme.radii.medium}
        backgroundColor={theme.colors.translucentBackgroundContrast}
      >
        <View
          style={{
            paddingHorizontal: theme.spacing.medium,
            paddingVertical: theme.spacing.medium + theme.spacing.xTiny,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="github" size={24} color={theme.colors.text} />

            <Gap size="xxSmall" />

            <Text
              style={[
                theme.text.headline,
                { color: theme.colors.text, flex: 1 },
              ]}
            >
              {t('proudlyOpenSource')}
            </Text>

            <Icon name="chevronRight" size={20} color={theme.colors.hint} />
          </View>

          <Gap size="xxSmall" axis="vertical" />

          <Text style={[theme.text.callout, { color: theme.colors.hint }]}>
            {t('openSourceExplanation')}
          </Text>
        </View>
      </GradientBorder>
    </FadePressable>
  );
}
