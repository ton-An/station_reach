import { t } from '@/core/i18n/translate';

/**
 * Everyone this app is obliged to credit.
 *
 * ! Required, not decorative. OpenStreetMap, CARTO and Transitous are all used
 * under licences that oblige us to credit them wherever the map is shown, and
 * the Impressum is a legal requirement.
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

export const REPOSITORY_URL = 'https://github.com/ton-An/station_reach';

/**
 * The attributions as one block of prose.
 *
 * The dialog finds and links the URLs in it rather than taking structured
 * rows — that is how the copy is authored.
 */
export const ATTRIBUTION_MESSAGE = ATTRIBUTIONS.map(
  ({ name, url }) => `${name}:\n${url}`
).join('\n\n');
