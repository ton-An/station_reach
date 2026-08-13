import type { TranslationKey } from '@/core/i18n/en';

/** The categories a failure can belong to. */
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
