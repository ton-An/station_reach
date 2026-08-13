import type { TranslationKey } from '@/core/i18n/en';

/**
 * The categories a failure can belong to.
 *
 * Kept centrally so that categories stay comparable across features. Each
 * category also has a union type of its own — see `NetworkingFailure` and
 * `TransitFailure` — which is what the Dart parent classes were for.
 */
export const FailureCategory = {
  Networking: 'networking',
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
 */
export interface FailureBase {
  readonly code: string;
  readonly categoryCode: FailureCategoryCode;
  readonly nameKey: TranslationKey;
  readonly messageKey: TranslationKey;
}
