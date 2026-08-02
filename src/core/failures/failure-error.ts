import type { Failure } from './failure';

/**
 * Carries a {@link Failure} across a `throw`.
 *
 * Only the data layer throws these, and only the repository layer catches them
 * — above that boundary failures travel as values inside `Result`.
 */
export class FailureError extends Error {
  constructor(readonly failure: Failure) {
    super(failure.code);
    this.name = 'FailureError';
  }
}
