import { FailureCategory, type Failure } from './failure';

/** A {@link Failure} originating from transit data rather than transport. */
export interface TransitFailure extends Failure {
  readonly categoryCode: typeof FailureCategory.Transit;
}

/**
 * No departures could be found for a station.
 *
 * Usually not a user error: it most often means the Transitous/MOTIS paging
 * cursor ran out, which the departures data source already retries around.
 */
export const noDeparturesFoundFailure: TransitFailure = {
  name: 'No Departures Found',
  message: 'No departures found for the given station.',
  categoryCode: FailureCategory.Transit,
  code: 'no_departures_found',
};
