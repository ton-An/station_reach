import 'package:flutter/material.dart';
import 'package:maplibre/maplibre.dart';

class MapWidget extends StatelessWidget {
  const MapWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return MapLibreMap(
      options: MapOptions(
        initCenter: Position(9.17, 47.68),
        initZoom: 2,
        initStyle:
            'https://api.maptiler.com/maps/streets-v2/style.json?key=TflVLODr98zL4hpAoXP1',
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
