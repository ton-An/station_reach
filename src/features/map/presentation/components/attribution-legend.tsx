import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Dialog } from '@/core/components/dialog';
import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
import { GradientBorder } from '@/core/components/gradient-border';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';

/**
 * Attribution for the map data and the app's legal pages.
 *
 * ! Required, not decorative. OpenStreetMap, CARTO and Transitous are all used
 * under licences that oblige us to credit them wherever the map is shown, and
 * the Impressum is a legal requirement. The icon may stay small, but it must
 * stay present and reachable.
 */
const ATTRIBUTIONS: readonly { readonly name: string; readonly url: string }[] =
  [
    {
      name: t('openStreetMapAttribution'),
      url: 'https://www.openstreetmap.org/copyright',
    },
    { name: t('cartoDBAttribution'), url: 'https://carto.com/attribution' },
    {
      name: t('dataSourcesAttribution'),
      url: 'https://transitous.org/sources/',
    },
    { name: t('transitousAttribution'), url: 'https://transitous.org/' },
    {
      name: t('privacyPolicy'),
      url: 'https://station-reach.eu/datenschutz.html',
    },
    { name: t('impressum'), url: 'https://station-reach.eu/impressum.html' },
  ];

const REPOSITORY_URL = 'https://github.com/ton-An/station_reach';

/** One block of prose; the dialog finds and links the URLs in it. */
const ATTRIBUTION_MESSAGE = ATTRIBUTIONS.map(
  ({ name, url }) => `${name}:\n${url}`
).join('\n\n');

/** The small info button that opens the attributions. */
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
            <MaterialIcons
              name="info"
              size={24}
              color={theme.colors.description}
            />
          </View>
        </FadePressable>
      </TranslucentSurface>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('attributions')}
        message={ATTRIBUTION_MESSAGE}
        additionalContent={<OpenSourceCard />}
        actions={[{ label: t('ok'), onPress: () => setIsOpen(false) }]}
      />
    </>
  );
}

/** The gradient-bordered "proudly open source" card inside the dialog. */
function OpenSourceCard() {
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
            <MaterialCommunityIcons
              name="github"
              size={24}
              color={theme.colors.text}
            />

            <Gap size="xxSmall" />

            <Text
              style={[
                theme.text.headline,
                { color: theme.colors.text, flex: 1 },
              ]}
            >
              {t('proudlyOpenSource')}
            </Text>

            <MaterialIcons
              name="arrow-forward-ios"
              size={20}
              color={theme.colors.hint}
            />
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
