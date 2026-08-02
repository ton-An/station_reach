import { View } from 'react-native';

import { AttributionLegend } from '../../components/attribution-legend';
import { TimeGradientLegend } from '../../components/time-gradient-legend';

/**
 * The travel-time key and the attribution button, side by side.
 *
 * They travel together: bottom-left of the map on a wide screen, tucked above
 * the sheet on a narrow one.
 *
 * The row spans the full width, so it stays transparent to input and each
 * legend opts back in — `box-none` is not usable, React Native Web drops it
 * when set through `style`.
 */
export function MapLegends() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}
    >
      <View style={{ pointerEvents: 'auto' }}>
        <TimeGradientLegend />
      </View>

      <View style={{ pointerEvents: 'auto' }}>
        <AttributionLegend />
      </View>
    </View>
  );
}
