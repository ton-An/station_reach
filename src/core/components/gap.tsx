import { View } from 'react-native';

import { spacing } from '@/core/theme/theme';

type SpacingKey = keyof typeof spacing;

interface GapProps {
  readonly size: SpacingKey;
  readonly axis?: 'horizontal' | 'vertical';
}

/**
 * Reads `spacing` directly instead of through `useTheme()`: `Gap` renders in
 * places with no hook context to call it from.
 */
export function Gap({
  size,
  axis = 'horizontal',
}: GapProps): React.JSX.Element {
  const value = spacing[size];

  return (
    <View
      style={axis === 'horizontal' ? { width: value } : { height: value }}
    />
  );
}
