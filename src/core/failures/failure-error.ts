import type { Failure } from './index';

/**
 * Carries a {@link Failure} up from a data source that already knows which
 * one it hit, so the repository can unwrap it instead of mapping an
 * exception through `mapHttpError`.
 */
export class FailureError extends Error {
  constructor(readonly failure: Failure) {
    super(failure.code);
    this.name = 'FailureError';
  }
}
