import { FailureCategory, type FailureBase } from './failure';

/**
 * No departures could be found for a station.
 *
 * Usually not a user error: it most often means the Transitous/MOTIS paging
 * cursor ran out, which the departures data source already retries around.
 */
export const noDeparturesFoundFailure = {
  code: 'no_departures_found',
  categoryCode: FailureCategory.Transit,
  nameKey: 'noDeparturesFoundFailureName',
  messageKey: 'noDeparturesFoundFailureMessage',
} as const satisfies FailureBase;

/**
 * Any failure originating from transit data rather than from transport.
 *
 * The equivalent of Dart's `TransitFailure` parent class. One member today — it
 * stays a union so that adding a second changes nothing at the call sites.
 */
export type TransitFailure = typeof noDeparturesFoundFailure;
