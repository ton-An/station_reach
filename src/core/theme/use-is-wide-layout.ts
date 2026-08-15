import { useWindowDimensions } from 'react-native';

import { layout } from './theme';

/**
 * Whether the viewport meets {@link layout.wideBreakpoint}, the one
 * breakpoint every wide/narrow branch in the app reads.
 */
export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();

  return width >= layout.wideBreakpoint;
}
