import { en, type TranslationKey } from './en';

/**
 * Looks up `key` in {@link en}.
 *
 * A plain call, not a hook: calling it at module scope resolves once, at
 * import time. Call it at render instead.
 *
 * @param key - The dictionary key to resolve.
 * @returns The translated string.
 */
export function t(key: TranslationKey): string {
  return en[key];
}
