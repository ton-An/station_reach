import { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/core/theme/use-theme';

interface GradientBorderProps {
  readonly colors: readonly string[];
  readonly radius: number;
  readonly width?: number;
  readonly children: React.ReactNode;
  readonly backgroundColor?: string;
}

/**
 * Draws a gradient outline around its children.
 *
 * React Native has no gradient border, and a gradient view behind an inset
 * child bleeds through a translucent fill. This strokes a rounded rect in SVG
 * instead.
 */
export function GradientBorder({
  colors,
  radius,
  width = 1.5,
  children,
  backgroundColor,
}: GradientBorderProps): React.JSX.Element {
  const theme = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const gradientId = useId().replace(/:/g, '');

  return (
    <View
      onLayout={(event) => setSize(event.nativeEvent.layout)}
      style={{
        borderRadius: radius,
        backgroundColor: backgroundColor ?? theme.colors.transparent,
      }}
    >
      {children}

      {size.width > 0 && (
        <Svg
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              {colors.map((color, index) => (
                <Stop
                  key={index}
                  offset={index / Math.max(colors.length - 1, 1)}
                  stopColor={color}
                />
              ))}
            </LinearGradient>
          </Defs>

          <Rect
            x={width / 2}
            y={width / 2}
            width={Math.max(size.width - width, 0)}
            height={Math.max(size.height - width, 0)}
            rx={radius}
            ry={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={width}
          />
        </Svg>
      )}
    </View>
  );
}
