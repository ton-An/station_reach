import { FailureCategory, type FailureBase } from './failure';

export const noDeparturesFoundFailure = {
  code: 'no_departures_found',
  categoryCode: FailureCategory.Transit,
  nameKey: 'noDeparturesFoundFailureName',
  messageKey: 'noDeparturesFoundFailureMessage',
} as const satisfies FailureBase;

/** The transit category of {@link Failure}. */
export type TransitFailure = typeof noDeparturesFoundFailure;
