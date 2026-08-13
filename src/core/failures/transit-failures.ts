import { FailureCategory, type FailureBase } from './failure';

export const noDeparturesFoundFailure = {
  code: 'no_departures_found',
  categoryCode: FailureCategory.Transit,
  nameKey: 'noDeparturesFoundFailureName',
  messageKey: 'noDeparturesFoundFailureMessage',
} as const satisfies FailureBase;

export type TransitFailure = typeof noDeparturesFoundFailure;
