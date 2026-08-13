import type { NetworkingFailure } from './networking-failures';
import type { TransitFailure } from './transit-failures';

/**
 * Union of all possible failures the app can produce. Narrows to a concrete
 * failure constant by its {@link FailureBase.code}, so no case is forgotten
 * in a handler.
 */
export type Failure = NetworkingFailure | TransitFailure;

export { FailureError } from './failure-error';
export { FailureCategory } from './failure';
export type { FailureBase, FailureCategoryCode } from './failure';
export * from './networking-failures';
export * from './transit-failures';
