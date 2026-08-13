import type { TranslationKey } from '@/core/i18n/en';

export const FailureCategory = {
  Networking: 'networking',
  Transit: 'transit',
} as const;

export type FailureCategoryCode =
  (typeof FailureCategory)[keyof typeof FailureCategory];

export interface FailureBase {
  readonly code: string;
  readonly categoryCode: FailureCategoryCode;
  readonly nameKey: TranslationKey;
  readonly messageKey: TranslationKey;
}
