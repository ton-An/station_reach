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
        context.read<TripsSelectionCubit>().unselectTrips();

        if (state is StationReachabilityStateSuccess) {
          _sortStationsByDuration(state.trips);
        }
      },
      child: BlocBuilder<TripsSelectionCubit, TripsSelectionState>(
        builder: (context, tripsSelectionState) {
          return BlocBuilder<
            StationReachabilityCubit,
            StationReachabilityState
          >(
            builder: (context, stationReachabilityState) {
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
                onEvent: (event) => _onEvent(event, stationReachabilityState),
                layers: <Layer>[
                  if (tripsSelectionState is TripsSelectedState)
                    for (int i = 0; i < tripsSelectionState.trips.length; i++)
                      PolylineLayer(
                        polylines: [
                          LineString(
                            coordinates: [
                              for (final stop
                                  in tripsSelectionState.trips[i].stops)
                                Position(stop.longitude, stop.latitude),
                            ],
                          ),
                        ],
                        color: ColorHelper.interpolateColors(
                          theme.colors.timelineGradient,
                          i / max(tripsSelectionState.trips.length - 1, 1),
                        ),
                        width: 5,
                        dashArray: [(.2 + i * .42).ceil(), 2],
                      ),
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
                        color: ColorHelper.interpolateColors(
                          theme.colors.timelineGradient,
                          key / max(_reachableStations.keys.length - 1, 1),
                        ),
                      ),
                ].reversed.toList(),
                children: const [_Legends(), _Controls()],
              );
            },
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

  void _onEvent(
    MapEvent event,
    StationReachabilityState stationReachabilityState,
  ) {
    if (event is MapEventClick &&
        stationReachabilityState is StationReachabilityStateSuccess) {
      final Position clickedPoint = event.point;

      final double metersPerPixel = controller.getMetersPerPixelAtLatitudeSync(
        clickedPoint.lat.toDouble(),
      );

      context.read<TripsSelectionCubit>().selectTrips(
        clickedPoint: clickedPoint,
        metersPerPixel: metersPerPixel,
        trips: stationReachabilityState.trips,
      );
    }
  }
}
