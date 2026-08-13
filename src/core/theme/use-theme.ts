import { theme, type Theme } from './theme';

/**
 * Returns the app theme.
 *
 * The app is light-only, so this is a constant today.
 */
export function useTheme(): Theme {
  return theme;
}
