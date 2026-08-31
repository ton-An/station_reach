import type { TranslationKey } from '@/core/i18n/en';

export const FailureCategory = {
  Networking: 'networking',
  Transit: 'transit',
} as const;

/** The category a {@link Failure} belongs to. */
export type FailureCategoryCode =
  (typeof FailureCategory)[keyof typeof FailureCategory];

/**
 * Base class every concrete failure extends. A failure is thrown or
 * returned as a value interchangeably, and narrowed with `instanceof` —
 * against `Failure` itself to test for any domain failure, or against a
 * concrete subclass for one in particular.
 */
export abstract class Failure extends Error {
  abstract readonly categoryCode: FailureCategoryCode;
  abstract readonly nameKey: TranslationKey;
  abstract readonly messageKey: TranslationKey;

  constructor(
    readonly code: string,
    options?: { readonly cause?: unknown }
  ) {
    super(code, options);
    this.name = new.target.name;
  }
}
