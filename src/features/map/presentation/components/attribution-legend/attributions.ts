import { t } from '@/core/i18n/translate';
import type { TranslationKey } from '@/core/i18n/en';

/**
 * Everyone this app is obliged to credit.
 *
 * ! Required, not decorative. OpenStreetMap, CARTO and Transitous are all used
 * under licences that oblige us to credit them wherever the map is shown, and
 * the Impressum is a legal requirement.
 *
 * Held as keys rather than resolved copy, so a second locale reaches them —
 * anything that calls `t` at module scope is frozen at import time.
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
 * The attributions as one block of prose.
 *
 * The dialog finds and links the URLs in it rather than taking structured
 * rows — that is how the copy is authored.
 *
 * @returns Every credit, one name-and-URL pair per paragraph.
 */
export function attributionMessage(): string {
  return ATTRIBUTIONS.map(({ nameKey, url }) => `${t(nameKey)}:\n${url}`).join(
    '\n\n'
  );
}
