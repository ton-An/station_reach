import { theme, type Theme } from './theme';

/**
 * Returns the app theme.
 *
 * The app is light-only, so this is a constant today. It stays a hook so that
 * components read tokens the same way the Flutter widgets read
 * `WebfabrikTheme.of(context)` — introducing a real provider later touches only
 * this file.
 *
 * Returns:
 * - the active {@link Theme}
 */
export function useTheme(): Theme {
  return theme;
}
