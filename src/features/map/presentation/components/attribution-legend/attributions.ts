import { t } from '@/core/i18n/translate';
import type { TranslationKey } from '@/core/i18n/en';

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

export function attributionMessage(): string {
  return ATTRIBUTIONS.map(({ nameKey, url }) => `${t(nameKey)}:\n${url}`).join(
    '\n\n'
  );
}
