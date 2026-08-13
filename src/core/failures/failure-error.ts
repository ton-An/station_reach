import type { Failure } from './index';

export class FailureError extends Error {
  constructor(readonly failure: Failure) {
    super(failure.code);
    this.name = 'FailureError';
  }
}
