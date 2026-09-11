import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { TranslucentSurface } from '@/core/components/translucent-surface';
import { flattenOnto, resampleGradient } from '@/core/helpers/color-helper';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';

import { GradientLabel } from './_gradient-label';

const BAR_WIDTH = 250;

const BAR_OPACITY = 0.85;

/**
 * How many stops the bar is drawn from. `LinearGradient` mixes its stops in
 * sRGB, so the Oklab curve the map is coloured by has to be sampled finely
 * enough that what the mixing does between two samples cannot be seen.
 */
const BAR_STOPS = 48;

/**
 * Legend for the travel-time colour scale that {@link colorForDuration}
 * paints markers, polylines and list rows with.
 *
 * Its three labels mark the scale's near, middle and far bounds: 30 minutes,
 * 6 hours and 18+ hours. The middle one is six rather than nine because the
 * scale is not linear in time — see `DURATION_SCALE_MINUTES`.
 */
export function TimeGradientLegend(): React.JSX.Element {
  const theme = useTheme();

  const [near, next, ...rest] = resampleGradient(
    theme.colors.timelineGradient,
    BAR_STOPS
  );
  const flatten = (color: string) =>
    flattenOnto({
      color,
      backdrop: theme.colors.background,
      alpha: BAR_OPACITY,
    });
  const gradient: readonly [string, string, ...string[]] = [
    flatten(near),
    flatten(next),
    ...rest.map(flatten),
  ];

  return (
    <TranslucentSurface radius={theme.radii.small} light>
      <View style={{ padding: theme.spacing.small }}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: BAR_WIDTH,
            height: theme.layout.legendHeight - theme.spacing.small * 2,
            borderRadius: theme.radii.small * 0.7,
          }}
        />

        <View
          style={[
            StyleSheet.absoluteFill,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.xxSmall,
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
            <GradientLabel text={t('sixHours')} />
          </View>

          <GradientLabel text={t('eighteenHoursPlus')} />
        </View>
      </View>
    </TranslucentSurface>
  );
}
