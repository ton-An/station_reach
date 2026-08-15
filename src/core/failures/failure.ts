import type { TranslationKey } from '@/core/i18n/en';

export const FailureCategory = {
  Networking: 'networking',
  Transit: 'transit',
} as const;

/** The category a {@link Failure} belongs to. */
export type FailureCategoryCode =
  (typeof FailureCategory)[keyof typeof FailureCategory];

/**
 * Shape every failure constant satisfies, via `as const satisfies
 * FailureBase`. That keeps `code` and `categoryCode` literal, so each
 * narrows {@link Failure} to its concrete failure and category.
 */
export interface FailureBase {
  readonly code: string;
  readonly categoryCode: FailureCategoryCode;
  readonly nameKey: TranslationKey;
  readonly messageKey: TranslationKey;
}
