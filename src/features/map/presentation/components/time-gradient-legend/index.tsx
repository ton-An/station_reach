/*
  To-Do:
    - [ ] Maybe make the legend interactive (e.g. tap a band to highlight only
          the stops reachable within it).
*/

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { TranslucentSurface } from '@/core/components/translucent-surface';
import { withAlpha } from '@/core/helpers/color-helper';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import { GradientLabel } from './_gradient-label';

const BAR_WIDTH = 250;
const BAR_HEIGHT = 36;

/**
 * The key to the travel-time colours.
 *
 * Labelled at 30 minutes, 7 hours and 14h+ — the ends of the ramp and its
 * midpoint. Anything beyond 14 hours saturates, which is what the `+` means.
 */
export function TimeGradientLegend() {
  const theme = useTheme();

  const gradient = theme.colors.timelineGradient.map((color) =>
    withAlpha(color, 0.85)
  );

  return (
    <TranslucentSurface radius={theme.radii.small} light>
      <View style={{ padding: theme.spacing.small + 1 }}>
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: BAR_WIDTH,
            height: BAR_HEIGHT,
            borderRadius: theme.radii.small * 0.7,
          }}
        />

        {/* Labels ride on top of the gradient rather than beside it. */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.xSmall + theme.spacing.xTiny,
            },
          ]}
        >
          <GradientLabel text={t('thirtyMin')} />

          <View
            style={{
              paddingHorizontal: theme.spacing.xSmall,
              paddingVertical: theme.spacing.xTiny,
              borderRadius: theme.radii.small,
              backgroundColor: theme.colors.translucentBackgroundContrast,
            }}
          >
            <GradientLabel text={t('sevenHours')} />
          </View>

          <GradientLabel text={t('fourteenHoursPlus')} />
        </View>
      </View>
    </TranslucentSurface>
  );
}
