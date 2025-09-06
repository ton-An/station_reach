import 'package:flutter/rendering.dart';

class ColorHelper {
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
