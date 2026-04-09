import 'package:flutter/rendering.dart';

/// {@template color_helper}
/// A helper class color related operations
/// {@endtemplate}
class ColorHelper {
  const ColorHelper();

  /// Interpolates a list of colors at a given [t] value.
  ///
  /// Parameters:
  /// - colors: The list of [Color]s to interpolate
  /// - t: The double value to interpolate at
  ///
  /// Returns:
  /// - The interpolated [Color]
  static Color interpolateColors(List<Color> colors, double t) {
    if (colors.length == 1 || t <= 0) return colors.first;
    if (t >= 1) return colors.last;

    final segmentLength = 1 / (colors.length - 1);
    final segmentIndex = (t / segmentLength).floor();
    final localT = (t - (segmentIndex * segmentLength)) / segmentLength;

    final colorStart = colors[segmentIndex];
    final colorEnd = colors[segmentIndex + 1];

    Color color = Color.lerp(colorStart, colorEnd, localT)!;

    return color;
  }
}
