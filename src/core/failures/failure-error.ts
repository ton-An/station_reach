import type { Failure } from './index';

/**
 * Carries a {@link Failure} as an exception. Data sources throw this when
 * they already know which failure applies. Repositories unwrap it back to a
 * failure, so the error path produces a {@link Failure} value across the
 * layer boundary.
 */
export class FailureError extends Error {
  constructor(readonly failure: Failure) {
    super(failure.code);
    this.name = 'FailureError';
  }
}
