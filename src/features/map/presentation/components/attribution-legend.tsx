import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { FadePressable } from '@/core/components/fade-pressable';
import { Gap } from '@/core/components/gap';
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
];

const REPOSITORY_URL = 'https://github.com/ton-An/station_reach';

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

      <AttributionDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

interface AttributionDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function AttributionDialog({ isOpen, onClose }: AttributionDialogProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.medium,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Swallow taps inside the card so they don't dismiss it. */}
        <Pressable
          onPress={() => {}}
          style={{ width: '100%', maxWidth: 340, maxHeight: '80%' }}
        >
          <View
            style={{
              borderRadius: theme.radii.large,
              backgroundColor: theme.colors.background,
              overflow: 'hidden',
            }}
          >
            <ScrollView
              contentContainerStyle={{ padding: theme.spacing.xMedium }}
            >
              <Text style={[theme.text.title3, { color: theme.colors.text }]}>
                {t('attributions')}
              </Text>

              <Gap size="xxSmall" axis="vertical" />

              <OpenSourceCard />

              <Gap size="xxSmall" axis="vertical" />

              {ATTRIBUTIONS.map(({ label, url }) => (
                <FadePressable
                  key={url}
                  onPress={() => void WebBrowser.openBrowserAsync(url)}
                >
                  <View style={{ paddingVertical: theme.spacing.xSmall }}>
                    <Text
                      style={[theme.text.body, { color: theme.colors.text }]}
                    >
                      {label}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        theme.text.footnote,
                        { color: theme.colors.hint },
                      ]}
                    >
                      {url}
                    </Text>
                  </View>
                </FadePressable>
              ))}
            </ScrollView>

            <FadePressable onPress={onClose}>
              <View
                style={{
                  paddingVertical: theme.spacing.medium,
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.translucentBackgroundContrast,
                }}
              >
                <Text style={[theme.text.body, { color: theme.colors.accent }]}>
                  {t('ok')}
                </Text>
              </View>
            </FadePressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** The gradient-bordered "proudly open source" card inside the dialog. */
function OpenSourceCard() {
  const theme = useTheme();

  return (
    <FadePressable
      onPress={() => void WebBrowser.openBrowserAsync(REPOSITORY_URL)}
    >
      <View
        style={{
          paddingHorizontal: theme.spacing.medium,
          paddingVertical: theme.spacing.medium + theme.spacing.xTiny,
          borderRadius: theme.radii.medium,
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.translucentBackgroundContrast,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="code" size={24} color={theme.colors.text} />

          <Gap size="xxSmall" />

          <Text
            style={[theme.text.headline, { color: theme.colors.text, flex: 1 }]}
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
    </FadePressable>
  );
}
