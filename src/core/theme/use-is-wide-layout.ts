import { useWindowDimensions } from 'react-native';

import { layout } from './theme';

export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();

  return width >= layout.wideBreakpoint;
}
