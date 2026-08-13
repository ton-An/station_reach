import { useWindowDimensions } from 'react-native';

import { layout } from './theme';

/**
 * Whether the screen is wide enough for a side-by-side layout.
 *
 * @returns True at or above {@link layout.wideBreakpoint}.
 */
export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();

  return width >= layout.wideBreakpoint;
}
