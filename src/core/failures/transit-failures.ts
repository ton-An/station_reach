import { Failure, FailureCategory } from './failure';

export class NoDeparturesFoundFailure extends Failure {
  readonly categoryCode = FailureCategory.Transit;
  readonly nameKey = 'noDeparturesFoundFailureName' as const;
  readonly messageKey = 'noDeparturesFoundFailureMessage' as const;

  constructor() {
    super('no_departures_found');
  }
}

/** The transit category of {@link Failure}. */
export type TransitFailure = NoDeparturesFoundFailure;
