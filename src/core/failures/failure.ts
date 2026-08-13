import type { TranslationKey } from '@/core/i18n/en';

/**
 * Named categories that failures belong to. Each category groups failures by
 * their origin so the app can handle categories differently.
 */
export const FailureCategory = {
  Networking: 'networking',
  Transit: 'transit',
} as const;

/**
 * The type of a {@link FailureCategory} value.
 */
export type FailureCategoryCode =
  (typeof FailureCategory)[keyof typeof FailureCategory];

/**
 * The common shape of all failure constants. A failure carries translation
 * keys but never copy, so failures can be displayed in any language without
 * changing code.
 */
export interface FailureBase {
  readonly code: string;
  readonly categoryCode: FailureCategoryCode;
  readonly nameKey: TranslationKey;
  readonly messageKey: TranslationKey;
}
