import { Failure, FailureCategory } from './failure';

/** The transit category of {@link Failure}. */
export abstract class TransitFailure extends Failure {
  readonly categoryCode = FailureCategory.Transit;
}

export class NoDeparturesFoundFailure extends TransitFailure {
  readonly nameKey = 'noDeparturesFoundFailureName' as const;
  readonly messageKey = 'noDeparturesFoundFailureMessage' as const;

  constructor() {
    super('no_departures_found');
  }
}
