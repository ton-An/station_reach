import { View } from 'react-native';

import { pointerEvents } from '@/core/components/pointer-events';
import { AttributionLegend } from './attribution-legend';
import { TimeGradientLegend } from './time-gradient-legend';

/**
 * The travel-time key and the attribution button, side by side.
 *
 * They travel together: bottom-left of the map on a wide screen, tucked above
 * the sheet on a narrow one.
 *
 * The row spans the full width, so the space between the two must fall
 * through to the map.
 */
export function MapLegends() {
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
