part of 'map_page.dart';

class _Map extends StatelessWidget {
  const _Map();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<StationReachabilityCubit, StationReachabilityState>(
      builder: (context, reachabilityState) {
        return MapLibreMap(
          options: MapOptions(
            initCenter: Position(9.17, 47.68),
            initZoom: 4,
            initStyle:
                'https://api.maptiler.com/maps/streets-v2/style.json?key=${Secrets.maptilerKey}',
          ),
          onStyleLoaded: (style) {
            style.setProjection(MapProjection.globe);
          },
          layers: [
            if (reachabilityState is StationReachabilityStateSuccess)
              CircleLayer(
                points: [
                  for (final trip in reachabilityState.trips)
                    for (final stop in trip.stops)
                      Point(
                        coordinates: Position(stop.longitude, stop.latitude),
                      ),
                ],
              ),
          ],
          children: [MapScalebar(), _Controls()],
        );
      },
    );
  }
}
