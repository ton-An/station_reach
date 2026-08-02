import * as WebBrowser from 'expo-web-browser';
import { Text, View } from 'react-native';

import { FadePressable } from '@/core/components/fade-pressable';
import { TranslucentSurface } from '@/core/components/translucent-surface';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';

/**
 * Attribution for the map data and the app's legal pages.
 *
 * ! Required, not decorative. OpenStreetMap, CARTO and Transitous are all
 * used under licences that oblige us to credit them wherever the map is shown,
 * and the Impressum is a legal requirement. Do not hide or collapse this away.
 */
const ATTRIBUTIONS: readonly {
  readonly label: string;
  readonly url: string;
}[] = [
  {
    label: t('openStreetMapAttribution'),
    url: 'https://www.openstreetmap.org/copyright',
  },
  { label: t('cartoDBAttribution'), url: 'https://carto.com/attribution' },
  {
    label: t('dataSourcesAttribution'),
    url: 'https://transitous.org/sources/',
  },
  { label: t('transitousAttribution'), url: 'https://transitous.org/' },
  {
    label: t('privacyPolicy'),
    url: 'https://station-reach.eu/datenschutz.html',
  },
  { label: t('impressum'), url: 'https://station-reach.eu/impressum.html' },
  { label: t('sourceCode'), url: 'https://github.com/ton-An/station_reach' },
];

export function AttributionLegend() {
  const theme = useTheme();

  return (
    <TranslucentSurface radius={theme.radii.small}>
      <View
        style={{
          paddingVertical: theme.spacing.small,
          paddingHorizontal: theme.spacing.xSmall,
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: theme.spacing.xSmall,
          maxWidth: 260,
        }}
      >
        {ATTRIBUTIONS.map(({ label, url }) => (
          <FadePressable
            key={url}
            onPress={() => void WebBrowser.openBrowserAsync(url)}
          >
            <Text
              style={[theme.text.caption2, { color: theme.colors.description }]}
            >
              {label}
            </Text>
          </FadePressable>
        ))}
      </View>
    </TranslucentSurface>
  );
}
