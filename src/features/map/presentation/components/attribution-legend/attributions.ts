import { t } from '@/core/i18n/translate';
import type { TranslationKey } from '@/core/i18n/en';

/**
 * Attribution entries for the map data and services.
 *
 * Holds translation keys rather than resolved strings because calling `t()`
 * at module scope fixes the text at import time, preventing dynamic language
 * switching. Attribution is a legal requirement and must remain visible and
 * reachable in all configurations.
 */
const ATTRIBUTIONS = [
  {
    nameKey: 'openStreetMapAttribution',
    url: 'https://www.openstreetmap.org/copyright',
  },
  { nameKey: 'cartoDBAttribution', url: 'https://carto.com/attribution' },
  { nameKey: 'dataSourcesAttribution', url: 'https://transitous.org/sources/' },
  { nameKey: 'transitousAttribution', url: 'https://transitous.org/' },
  {
    nameKey: 'privacyPolicy',
    url: 'https://station-reach.eu/datenschutz.html',
  },
  { nameKey: 'impressum', url: 'https://station-reach.eu/impressum.html' },
] as const satisfies readonly {
  readonly nameKey: TranslationKey;
  readonly url: string;
}[];

/**
 * URL of the Station Reach GitHub repository.
 */
export const REPOSITORY_URL = 'https://github.com/ton-An/station_reach';

/**
 * Formats attributions into a multi-line message.
 *
 * @returns A newline-separated string of attribution name and URL pairs.
 */
export function attributionMessage(): string {
  return ATTRIBUTIONS.map(({ nameKey, url }) => `${t(nameKey)}:\n${url}`).join(
    '\n\n'
  );
}
