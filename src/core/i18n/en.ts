/** English copy. Ported from the Flutter `app_en.arb`. */
export const en = {
  appName: 'Station Reach',
  searchStations: 'Search Stations',
  results: 'Results',
  departures: 'Departures',
  noStopSelected: 'No stop selected',
  thirtyMin: '30min',
  sevenHours: '7h',
  fourteenHoursPlus: '14h+',
  openStreetMapAttribution: '© OpenStreetMap',
  cartoDBAttribution: '© CartoDB',
  dataSourcesAttribution: 'Data Sources',
  transitousAttribution: 'Data processed by Transitous',
  privacyPolicy: 'Privacy Policy',
  impressum: 'Impressum',
  attributions: 'Attributions',
  ok: 'OK',
  proudlyOpenSource: 'Proudly Open Source',
  openSourceExplanation:
    'This app is open source. Take a look at the code, report an issue, or contribute.',
} as const;

export type TranslationKey = keyof typeof en;
