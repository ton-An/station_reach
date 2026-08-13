import type { Failure } from './index';

/** Carries a {@link Failure} across a `throw`. */
export class FailureError extends Error {
  constructor(readonly failure: Failure) {
    super(failure.code);
    this.name = 'FailureError';
  }
}
