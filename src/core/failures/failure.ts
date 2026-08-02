/**
 * The categories a {@link Failure} can belong to.
 *
 * Kept centrally so that categories stay comparable across features.
 */
export const FailureCategory = {
  General: 'general',
  Authentication: 'authentication',
  Networking: 'networking',
  Storage: 'storage',
  Permission: 'permission',
  Transit: 'transit',
} as const;

export type FailureCategoryCode =
  (typeof FailureCategory)[keyof typeof FailureCategory];

/**
 * An expected, recoverable error.
 *
 * Failures are values, not exceptions: they travel through `Result` and are
 * never thrown across a layer boundary. Define each one as a module-level
 * constant rather than assembling it at the call site, so that a given `code`
 * always carries the same copy.
 */
export interface Failure {
  readonly name: string;
  readonly message: string;
  readonly categoryCode: FailureCategoryCode;
  readonly code: string;
}
