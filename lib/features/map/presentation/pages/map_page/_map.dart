part of 'map_page.dart';

// when polylines go between the same station, they should overlay each other with gaps and not with different thicknesses
// maybe color the polylines according to the durations. if there are overlays. use different saturation values

class _Map extends StatefulWidget {
  const _Map();

  @override
  State<_Map> createState() => _MapState();
}

class _MapState extends State<_Map> {
  late MapController mapController;
  final List<Polyline> _tripsPolylines = [];
  final List<CircleMarker<Stop>> _reachableStationsLayers = [];

  late LayerHitNotifier<Stop> hitNotifier;

  Stop? _hitStation;

  @override
  void initState() {
    super.initState();
    mapController = MapController();
    hitNotifier = ValueNotifier(null)
      ..addListener(() {
        final LayerHitResult<Stop>? result = hitNotifier.value;

        if (result != null &&
            context.read<StationReachabilityCubit>().state
                is StationReachabilityStateSuccess) {
          _hitStation = result.hitValues.first;
        }
      });
  }

  void _onMarkerHit() {
    context.read<StationSelectionCubit>().selectStation(
      selectedStop: _hitStation!,
      departures:
          (context.read<StationReachabilityCubit>().state
                  as StationReachabilityStateSuccess)
              .departures,
    );
  }

  @override
  void dispose() {
    hitNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<StationReachabilityCubit, StationReachabilityState>(
      listener: (context, state) {
        context.read<StationSelectionCubit>().unselectStation();

        if (state is StationReachabilityStateSuccess) {
          _generateStationMarkers(state.departures);
          print(state.station.latitude);
          mapController.move(
            LatLng(state.station.latitude, state.station.longitude),
            6,
          );
        }
      },
      child: BlocConsumer<StationSelectionCubit, StationSelectionState>(
        listener: (context, stationSelectionState) {
          if (stationSelectionState is StationSelectedState) {
            _generateTripsPolylines(stationSelectionState.departures);
          }
        },
        builder: (context, stationSelectionState) {
          return BlocBuilder<
            StationReachabilityCubit,
            StationReachabilityState
          >(
            builder: (context, stationReachabilityState) {
              return FlutterMap(
                mapController: mapController,
                options: MapOptions(
                  initialCenter: LatLng(42.68, 10.127),
                  initialZoom: 4,
                  minZoom: 1.5,
                  onTap: (_, _) {
                    if (_hitStation != null) {
                      _onMarkerHit();
                    }
                  },
                  onMapEvent: (event) {
                    if (event is MapEventMove) {
                      _hitStation = null;
                    }
                  },
                ),
                children: [
                  TileLayer(
                    urlTemplate:
                        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    subdomains: const ['a', 'b', 'c'],
                    userAgentPackageName: 'com.stationreach.app',
                  ),

                  TranslucentPointer(
                    child: CircleLayer(
                      circles: _reachableStationsLayers,
                      hitNotifier: hitNotifier,
                    ),
                  ),

                  RawGestureDetector(
                    behavior: HitTestBehavior.translucent,
                    gestures: <Type, GestureRecognizerFactory>{
                      TapGestureRecognizer:
                          GestureRecognizerFactoryWithHandlers<
                            TapGestureRecognizer
                          >(() => TapGestureRecognizer(), (r) {
                            r.onTap = () {
                              if (_hitStation != null) {
                                _onMarkerHit();
                              }
                            };
                          }),
                    },
                  ),

                  TranslucentPointer(
                    child: MultiPolylineLayer(polylines: _tripsPolylines),
                  ),
                ],
              );

              // );
            },
          );
        },
      ),
    );
  }

  void _generateStationMarkers(List<Departure> trips) {
    _reachableStationsLayers.clear();

    final Map<String, dynamic> reachableStations = {};

    for (final trip in trips) {
      for (final station in trip.stops) {
        final duration = station.duration.inMinutes;

        int durationIn30Minutes = (duration ~/ 30).clamp(0, 28);

        if (reachableStations[station.id] == null ||
            reachableStations[station.id]!['duration'] > durationIn30Minutes) {
          reachableStations[station.id] = {
            'duration': durationIn30Minutes,
            'station': station,
          };
        }
      }
    }

    for (final stationId in reachableStations.keys) {
      _reachableStationsLayers.add(
        CircleMarker(
          point: LatLng(
            reachableStations[stationId]['station'].latitude,
            reachableStations[stationId]['station'].longitude,
          ),
          // point: LatLng(8.127, 47.68),
          radius: 8,
          color: ColorHelper.interpolateColors(
            WebfabrikTheme.of(context).colors.timelineGradient,
            reachableStations[stationId]['duration'] / 28,
          ).withValues(alpha: .75),
          borderStrokeWidth: 26,
          borderColor: Colors.transparent,
          hitValue: reachableStations[stationId]['station'],
        ),
      );
    }

    setState(() {});
  }

  void _generateTripsPolylines(List<Departure> trips) {
    _tripsPolylines.clear();

    for (final trip in trips) {
      final Color color = ColorHelper.interpolateColors(
        WebfabrikTheme.of(context).colors.secondaryGradient,
        trips.indexOf(trip) / max(trips.length - 1, 1),
      ).withValues(alpha: .7);

      _tripsPolylines.insert(
        0,
        Polyline(
          points: [
            for (final stop in trip.stops)
              LatLng(stop.latitude, stop.longitude),
          ],
          strokeWidth: 5,
          strokeCap: StrokeCap.round,
          strokeJoin: StrokeJoin.round,
          color: color,
        ),
      );
    }
  }

  void _onEvent(
    MapEvent event,
    StationReachabilityState stationReachabilityState,
  ) {
    // if (event is MapEventClick &&
    //     stationReachabilityState is StationReachabilityStateSuccess) {
    //   final Position clickedPoint = event.point;

    //   final double metersPerPixel = controller.getMetersPerPixelAtLatitudeSync(
    //     clickedPoint.lat.toDouble(),
    //   );

    //   context.read<StationSelectionCubit>().selectStation(
    //     clickedPoint: clickedPoint,
    //     metersPerPixel: metersPerPixel,
    //     trips: stationReachabilityState.trips,
    //   );
    // }
  }
}
