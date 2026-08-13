import { View } from 'react-native';

import { pointerEvents } from '@/core/components/pointer-events';
import { AttributionLegend } from './attribution-legend';
import { TimeGradientLegend } from './time-gradient-legend';

/**
 * Container for all map legends.
 *
 * Arranges travel time and attribution legends side by side on the map.
 */
export function MapLegends(): React.JSX.Element {
  return (
    <View
      style={[
        pointerEvents.passThrough,
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        },
      ]}
    >
      <TimeGradientLegend />

      <AttributionLegend />
    </View>
  );
}
