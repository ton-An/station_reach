import { FailureCategory, type FailureBase } from './failure';

/** No departures could be found for a station. */
export const noDeparturesFoundFailure = {
  code: 'no_departures_found',
  categoryCode: FailureCategory.Transit,
  nameKey: 'noDeparturesFoundFailureName',
  messageKey: 'noDeparturesFoundFailureMessage',
} as const satisfies FailureBase;

/** Any failure originating from transit data rather than from transport. */
export type TransitFailure = typeof noDeparturesFoundFailure;
