part of 'map_page.dart';

// when polylines go between the same station, they should overlay each other with gaps and not with different thicknesses
// maybe color the polylines according to the durations. if there are overlays. use different saturation values

class _Map extends StatefulWidget {
  const _Map();

  @override
  State<_Map> createState() => _MapState();
}

class _MapState extends State<_Map> {
  late MapController controller;
  final List<Polyline> _tripsPolylines = [];
  final List<CircleMarker<ReachableStation>> _reachableStationsLayers = [];

  late LayerHitNotifier<ReachableStation> hitNotifier;

  ReachableStation? _hitStation;

  @override
  void initState() {
    super.initState();
    hitNotifier = ValueNotifier(null)
      ..addListener(() {
        final LayerHitResult<ReachableStation>? result = hitNotifier.value;

        if (result != null &&
            context.read<StationReachabilityCubit>().state
                is StationReachabilityStateSuccess) {
          _hitStation = result.hitValues.first;
        }
      });
  }

  void _onMarkerHit() {
    context.read<StationSelectionCubit>().selectStation(
      station: _hitStation!,
      trips:
          (context.read<StationReachabilityCubit>().state
                  as StationReachabilityStateSuccess)
              .trips,
    );
  }

  @override
  void dispose() {
    hitNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return BlocListener<StationReachabilityCubit, StationReachabilityState>(
      listener: (context, state) {
        context.read<StationSelectionCubit>().unselectStation();

        if (state is StationReachabilityStateSuccess) {
          _generateStationMarkers(state.trips);
        }
      },
      child: BlocConsumer<StationSelectionCubit, StationSelectionState>(
        listener: (context, stationSelectionState) {
          if (stationSelectionState is StationSelectedState) {
            _generateTripsPolylines(stationSelectionState.trips);
            // _layers = [];
            // for (int i = 0; i < stationSelectionState.trips.length; i++) {
            //   _layers.insert(
            //     0,
            //     PolylineLayer(
            //       polylines: [
            //         LineString(
            //           coordinates: [
            //             for (final stop in stationSelectionState.trips[i].stops)
            //               Position(stop.longitude, stop.latitude),
            //           ],
            //         ),
            //       ],
            //       color: ColorHelper.interpolateColors(
            //         theme.colors.timelineGradient,
            //         i / max(stationSelectionState.trips.length - 1, 1),
            //       ),
            //       width: 7,
            //       // dashArray: [(.2 + i * .42).ceil(), 2],
            //     ),
            //   );
            // }
          }
        },
        builder: (context, stationSelectionState) {
          return BlocBuilder<
            StationReachabilityCubit,
            StationReachabilityState
          >(
            builder: (context, stationReachabilityState) {
              return FlutterMap(
                options: MapOptions(
                  initialCenter: LatLng(47.68, 11.72),
                  initialZoom: 4,
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
                    child: PolylineLayer(polylines: _tripsPolylines),
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

  void _generateStationMarkers(List<Trip> trips) {
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
          radius: 11,
          color: ColorHelper.interpolateColors(
            WebfabrikTheme.of(context).colors.timelineGradient,
            reachableStations[stationId]['duration'] / 28,
          ),
          borderStrokeWidth: 20,
          borderColor: Colors.transparent,
          hitValue: reachableStations[stationId]['station'],
        ),
      );
    }

    setState(() {});
  }

  void _generateTripsPolylines(List<Trip> trips) {
    _tripsPolylines.clear();

    for (final trip in trips) {
      final Color color = ColorHelper.interpolateColors(
        WebfabrikTheme.of(context).colors.timelineGradient,
        trips.indexOf(trip) / max(trips.length - 1, 1),
      );
      final HSLColor hslColor = HSLColor.fromColor(color);

      const double lightnessChangeAmount = .1;

      final bool isDark = hslColor.lightness < 0.5;
      final double adjustedLightness =
          (isDark
                  ? hslColor.lightness + lightnessChangeAmount
                  : hslColor.lightness - lightnessChangeAmount)
              .clamp(0.0, 1.0);

      final Color lighterColor = hslColor
          .withLightness(adjustedLightness)
          .toColor();

      _tripsPolylines.insert(
        0,
        Polyline(
          points: [
            for (final stop in trip.stops)
              LatLng(stop.latitude, stop.longitude),
          ],
          strokeWidth: 10,
          strokeCap: StrokeCap.round,
          strokeJoin: StrokeJoin.round,
          color: lighterColor,
          pattern: StrokePattern.dashed(segments: const [20, 20]),
        ),
      );
      _tripsPolylines.insert(
        0,
        Polyline(
          points: [
            for (final stop in trip.stops)
              LatLng(stop.latitude, stop.longitude),
          ],
          strokeWidth: 9,
          strokeCap: StrokeCap.round,
          strokeJoin: StrokeJoin.round,
          borderStrokeWidth: trips.indexOf(trip) / trips.length * 12,
          borderColor: color.withValues(alpha: .5),
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
