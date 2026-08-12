import { useWindowDimensions } from 'react-native';

import { layout } from './theme';

/**
 * Whether there is room beside the map for chrome.
 *
 * The app has exactly one breakpoint, and three unrelated pieces of chrome —
 * the sheet, the legends and the notification — have to agree about which side
 * of it they are on. Measuring by hand in each of them is how they drift apart.
 *
 * Returns:
 * - true at or above {@link layout.wideBreakpoint}
 */
export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();

  return width >= layout.wideBreakpoint;
}
