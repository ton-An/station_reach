part of 'map_page.dart';

class _Map extends StatefulWidget {
  const _Map();

  @override
  State<_Map> createState() => _MapState();
}

class _MapState extends State<_Map> {
  final Map<int, List<ReachableStation>> _reachableStations = {};
  late MapController controller;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return BlocListener<StationReachabilityCubit, StationReachabilityState>(
      listener: (context, state) {
        if (state is StationReachabilityStateSuccess) {
          _sortStationsByDuration(state.trips);
        }
      },
      child: BlocBuilder<StationReachabilityCubit, StationReachabilityState>(
        builder: (context, state) {
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
            onMapCreated: (controller) {
              this.controller = controller;
            },
            onEvent: (event) => _onEvent(event, state),
            layers: [
              if (_reachableStations.isNotEmpty)
                for (final key in _reachableStations.keys)
                  CircleLayer(
                    points: [
                      for (final station in _reachableStations[key]!)
                        Point(
                          coordinates: Position(
                            station.longitude,
                            station.latitude,
                          ),
                        ),
                    ],
                    color: _interpolateColors(
                      theme.colors.timelineGradient,
                      key / (_reachableStations.keys.length - 1),
                    ),
                  ),
            ].reversed.toList(),
            children: const [_Legends(), _Controls()],
          );
        },
      ),
    );
  }

  void _sortStationsByDuration(List<Trip> trips) {
    _reachableStations.clear();

    for (final trip in trips) {
      for (final station in trip.stops) {
        final duration = station.duration.inMinutes;

        int key = (duration ~/ 30).clamp(0, 28);

        if (_reachableStations.containsKey(key)) {
          _reachableStations[key]!.add(station);
        } else {
          _reachableStations[key] = [station];
        }
      }
    }

    setState(() {});
  }

  Color _interpolateColors(List<Color> colors, double t) {
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

  void _onEvent(MapEvent event, StationReachabilityState state) {
    if (event is MapEventClick && state is StationReachabilityStateSuccess) {
      final Position clickedPoint = event.point;

      final double metersPerPixel = controller.getMetersPerPixelAtLatitudeSync(
        clickedPoint.lat.toDouble(),
      );

      final maxDistance = metersPerPixel * 10;

      for (final Trip trip in state.trips) {
        for (final stop in trip.stops) {
          final double distance = geo.Geolocator.distanceBetween(
            stop.latitude,
            stop.longitude,
            clickedPoint.lat.toDouble(),
            clickedPoint.lng.toDouble(),
          );

          if (distance < maxDistance) {
            showModalBottomSheet(
              context: context,
              barrierColor: Colors.transparent,
              backgroundColor: Colors.transparent,
              builder: (context) => _TripInfo(trip: trip),
            );
            return;
          }
        }
      }
    }
  }
}
