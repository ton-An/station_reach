/** English copy. Ported from the Flutter `app_en.arb`. */
export const en = {
  // -- Map -- //
  searchStations: 'Search Stations',
  departures: 'Departures',
  noStopSelected: 'No stop selected',
  // The travel-time legend's labels: both ends of the ramp and its midpoint.
  // They spell out `GRADIENT_BUCKETS` — keep them in step with it.
  thirtyMin: '30min',
  nineHours: '9h',
  eighteenHoursPlus: '18h+',

  // -- Attributions -- //
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

  // -- Failures -- //
  // Every failure constant names two of these; nothing else may hold user copy.
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

export type TranslationKey = keyof typeof en;
