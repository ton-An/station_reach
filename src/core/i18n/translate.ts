import { en, type TranslationKey } from './en';

export function t(key: TranslationKey): string {
  return en[key];
}
