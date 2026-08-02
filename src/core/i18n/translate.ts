import { en, type TranslationKey } from './en';

/*
  To-Do:
    - [ ] Add locales beyond English. When a second one lands, select the
          dictionary from `expo-localization`'s `getLocales()` here rather than
          at every call site.
*/

/**
 * Looks up a user-facing string.
 *
 * Every string the user can read goes through here — no literals in components,
 * even while English is the only locale.
 *
 * Parameters:
 * - key: the translation key
 *
 * Returns:
 * - the translated string
 */
export function t(key: TranslationKey): string {
  return en[key];
}
