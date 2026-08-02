import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:material_symbols_icons/symbols.dart';

class IconHelper {
  static Widget getTransitModeIcon({
    required TransitMode mode,
    required double size,
    required Color color,
  }) {
    switch (mode) {
      case TransitMode.rail ||
          TransitMode.regionalFastRail ||
          TransitMode.suburban ||
          TransitMode.regionalRail:
        return Icon(Symbols.train_rounded, size: size, color: color);
      case TransitMode.tram:
        return Padding(
          padding: EdgeInsets.only(bottom: size * .15),
          child: Icon(Symbols.tram_rounded, size: size, color: color),
        );
      case TransitMode.highspeedRail || TransitMode.longDistance:
        return Icon(Symbols.train_rounded, size: size, color: color);

      case TransitMode.nightRail:
        return Padding(
          padding: EdgeInsets.only(bottom: size * .2),
          child: SvgPicture.asset(
            'assets/icons/test.svg',
            width: size,
            height: size,
            colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
          ),
        );
      case TransitMode.subway || TransitMode.metro:
        return Padding(
          padding: EdgeInsets.only(bottom: size * .15),
          child: Icon(Symbols.subway, size: size, color: color),
        );
      case TransitMode.bus:
        return Icon(Symbols.directions_bus_rounded, size: size, color: color);
      case TransitMode.coach:
        return SvgPicture.asset(
          'assets/icons/coach.svg',
          width: size,
          height: size,
          colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
        );
      case TransitMode.ferry:
        return Icon(Symbols.directions_boat_rounded, size: size, color: color);
      case TransitMode.funicular:
        return Icon(Symbols.funicular_rounded, size: size, color: color);
      default:
        return Icon(Icons.question_mark_rounded, size: size, color: color);
    }
  }
}
