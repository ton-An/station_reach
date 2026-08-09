import type { TranslationKey } from '@/core/i18n/en';

/**
 * The categories a failure can belong to.
 *
 * Kept centrally so that categories stay comparable across features. Each
 * category also has a union type of its own — see `NetworkingFailure` and
 * `TransitFailure` — which is what the Dart parent classes were for.
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
 * The shape every failure constant satisfies.
 *
 * This is the contract, not the type failures travel as — that is `Failure`,
 * the union of every concrete failure in the app. Declare each one with
 * `as const satisfies FailureBase`, so the shape is checked while `code` and
 * `categoryCode` keep their literal types.
 *
 * Both of those are discriminants, so comparing either narrows a `Failure` to
 * the concrete failure or to the category it belongs to — the two things the
 * Dart class hierarchy gave us, without the hierarchy:
 *
 * ```ts
 * if (failure.code === noDeparturesFoundFailure.code) {
 *   // failure is TransitFailure here
 * }
 *
 * if (failure.categoryCode === FailureCategory.Networking) {
 *   // failure is NetworkingFailure here
 * }
 * ```
 *
 * Failures carry translation *keys*, never copy. Nothing between the data layer
 * and the notification that renders it should hold a user-facing sentence.
 */
export interface FailureBase {
  readonly code: string;
  readonly categoryCode: FailureCategoryCode;
  readonly nameKey: TranslationKey;
  readonly messageKey: TranslationKey;
}
