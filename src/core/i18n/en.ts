/**
 * The English dictionary — the only locale the app has. Keys are camelCase;
 * a failure's keys are `<name>FailureName` and `<name>FailureMessage`.
 */
export const en = {
  back: 'Back',
  searchStations: 'Search Stations',
  departures: 'Departures',
  noStopSelected: 'No stop selected',
  thirtyMin: '30min',
  sixHours: '6h',
  eighteenHoursPlus: '18h+',
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
  webDescription: 'See where transit takes you!',
  receiveTimeoutFailureName: 'Receive Timeout',
  receiveTimeoutFailureMessage:
    'Receiving the response from the server timed out.',
  requestCancelledFailureName: 'Request Cancelled',
  requestCancelledFailureMessage: 'The request was cancelled.',
  connectionFailureName: 'No Connection',
  connectionFailureMessage:
    'Could not reach the server. Check your internet connection.',
  statusCodeNotOkFailureName: 'Request Failed',
  statusCodeNotOkFailureMessage: 'The server rejected the request.',
  badResponseFailureName: 'Invalid Response',
  badResponseFailureMessage: 'The server returned an invalid response.',
  unknownRequestFailureName: 'Unknown Error',
  unknownRequestFailureMessage:
    'Something went wrong while talking to the server.',
  noDeparturesFoundFailureName: 'No Departures Found',
  noDeparturesFoundFailureMessage: 'No departures found for the given station.',
} as const;

/** Every valid key `t` accepts, derived from {@link en}. */
export type TranslationKey = keyof typeof en;
