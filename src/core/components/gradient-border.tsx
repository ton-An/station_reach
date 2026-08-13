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
 * React Native has no gradient border, and the usual trick — a gradient view
 * with an inset child — bleeds through whenever the fill is translucent, which
 * here it always is. Stroking a rounded rect in SVG gives a true border over
 * whatever shows through the middle.
 */
export function GradientBorder({
  colors,
  radius,
  width = 1.5,
  children,
  backgroundColor,
}: GradientBorderProps) {
  const theme = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  // A colon is invalid in an SVG id, and `useId` has shipped ids carrying one.
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

          {/* Inset by half the stroke so the outline sits inside the bounds. */}
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
