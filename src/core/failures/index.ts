import type { NetworkingFailure } from './networking-failures';
import type { TransitFailure } from './transit-failures';

/**
 * Every failure the app can produce.
 *
 * This is what travels inside a `Result` and what every layer boundary is typed
 * against. Because it is a union of concrete constants rather than one open
 * interface, `code` and `categoryCode` both narrow it — see {@link FailureBase}.
 */
export type Failure = NetworkingFailure | TransitFailure;

export { FailureError } from './failure-error';
export { FailureCategory } from './failure';
export type { FailureBase, FailureCategoryCode } from './failure';
export * from './networking-failures';
export * from './transit-failures';
