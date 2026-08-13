import { View } from 'react-native';

import { spacing } from '@/core/theme/theme';

type SpacingKey = keyof typeof spacing;

interface GapProps {
  readonly size: SpacingKey;
  /** Horizontal by default; set for spacing between stacked rows. */
  readonly axis?: 'horizontal' | 'vertical';
}

/**
 * Fixed whitespace between siblings.
 *
 * Preferred over ad-hoc margins, the same way the Flutter code used
 * `SmallGap()` — the gap belongs between the elements, not to either of them.
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
