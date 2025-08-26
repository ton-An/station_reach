import 'package:flutter/material.dart';
import 'package:maplibre/maplibre.dart';
import 'package:station_reach/secrets.dart';

class MapPage extends StatelessWidget {
  const MapPage({super.key});

  static const String pageName = 'map';
  static const String route = '/$pageName';

  @override
  Widget build(BuildContext context) {
    return MapLibreMap(
      options: MapOptions(
        initCenter: Position(9.17, 47.68),
        initZoom: 2,
        initStyle:
            'https://api.maptiler.com/maps/streets-v2/style.json?key=${Secrets.maptilerKey}',
      ),
      children: const [
        MapScalebar(),
        SourceAttribution(),
        MapControlButtons(showTrackLocation: true),
        MapCompass(),
      ],
      onStyleLoaded: (style) {
        style.setProjection(MapProjection.globe);
      },
    );
  }
}
