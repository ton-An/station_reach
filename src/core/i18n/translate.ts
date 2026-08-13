/*
  To-Do:
    - [ ] Add locales beyond English. When a second one lands, select the
          dictionary from `expo-localization`'s `getLocales()` here rather than
          at every call site.
*/

import { en, type TranslationKey } from './en';

/** Looks up a user-facing string. */
export function t(key: TranslationKey): string {
  return en[key];
}
