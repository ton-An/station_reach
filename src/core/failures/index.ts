import type { NetworkingFailure } from './networking-failures';
import type { TransitFailure } from './transit-failures';

/** Every failure the app can produce — see {@link FailureBase}. */
export type Failure = NetworkingFailure | TransitFailure;

export { FailureError } from './failure-error';
export { FailureCategory } from './failure';
export type { FailureBase, FailureCategoryCode } from './failure';
export * from './networking-failures';
export * from './transit-failures';
