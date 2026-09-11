import type { TranslationKey } from '@/core/i18n/en';
import { t } from '@/core/i18n/translate';

/**
 * Attribution entries, keyed by translation key rather than resolved text.
 *
 * `t` reads the current locale, so resolving these at module scope would
 * freeze every name at import time. Keys are resolved only when
 * {@link attributionMessage} runs, at render.
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

export const REPOSITORY_URL = 'https://github.com/ton-An/station_reach';

/**
 * The attribution text, one entry per line, keys resolved to the current
 * locale.
 */
export function attributionMessage(): string {
  return ATTRIBUTIONS.map(({ nameKey, url }) => `${t(nameKey)}:\n${url}`).join(
    '\n\n'
  );
}
