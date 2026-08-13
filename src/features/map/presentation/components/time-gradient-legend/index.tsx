import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { TranslucentSurface } from '@/core/components/translucent-surface';
import { flattenOnto } from '@/core/helpers/color-helper';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';
import { GradientLabel } from './_gradient-label';

const BAR_WIDTH = 250;
const BAR_HEIGHT = 36;

const BAR_OPACITY = 0.85;

export function TimeGradientLegend(): React.JSX.Element {
  const theme = useTheme();

  const [near, next, ...rest] = theme.colors.timelineGradient;
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
      <View style={{ padding: theme.spacing.small + theme.spacing.tiny }}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: BAR_WIDTH,
            height: BAR_HEIGHT,
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
            <GradientLabel text={t('nineHours')} />
          </View>

          <GradientLabel text={t('eighteenHoursPlus')} />
        </View>
      </View>
    </TranslucentSurface>
  );
}
