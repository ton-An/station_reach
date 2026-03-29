part of 'map_page.dart';

class _MapStationMarkersLayer extends StatefulWidget {
  const _MapStationMarkersLayer({
    required this.hitNotifier,
    required this.mapController,
  });

  final LayerHitNotifier<Stop> hitNotifier;
  final MapController mapController;

  @override
  State<_MapStationMarkersLayer> createState() =>
      _MapStationMarkersLayerState();
}

class _MapStationMarkersLayerState extends State<_MapStationMarkersLayer> {
  final List<CircleMarker<Stop>> _reachableStationsMarkers = [];
  final List<Marker> _reachableStationsTextMarkers = [];
  final List<Marker> _visibleStationTextMarkers = [];
  int _lastZoom = 0;

  @override
  void initState() {
    super.initState();
    widget.mapController.mapEventStream.listen((event) {
      if (event is MapEventScrollWheelZoom) {
        final int currentZoom = event.camera.zoom.round();
        if (currentZoom != _lastZoom) {
          _updateClusters();
          _lastZoom = currentZoom;
        }
      }

      if (event is MapEventMoveEnd ||
          event is MapEventDoubleTapZoomEnd ||
          event is MapEventRotateEnd) {
        _updateClusters();
      }
    });
  }

  void _updateClusters() {
    _visibleStationTextMarkers.clear();
    final supercluster = SuperclusterImmutable<Marker>(
      getX: (p) => p.point.longitude,
      getY: (p) => p.point.latitude,
      radius: 70,
    )..load(_reachableStationsTextMarkers);

    final clustersAndPoints = supercluster.search(
      widget.mapController.camera.visibleBounds.west,
      widget.mapController.camera.visibleBounds.south,
      widget.mapController.camera.visibleBounds.east,
      widget.mapController.camera.visibleBounds.north,
      widget.mapController.camera.zoom.round(),
    );

    final List<Marker> points = [];
    for (final cluster in clustersAndPoints) {
      if (cluster is ImmutableLayerPoint<Marker>) {
        points.add(cluster.originalPoint);
      }
    }

    _visibleStationTextMarkers.addAll(points);

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<StationDeparturesCubit, StationDeparturesState>(
      listener: (context, state) {
        if (state is StationDeparturesLoaded) {
          _generateStationMarkers(state.departures);
        }
      },
      child: TranslucentPointer(
        child: Stack(
          children: [
            MarkerLayer(markers: _visibleStationTextMarkers),

            CircleLayer(
              circles: _reachableStationsMarkers,
              hitNotifier: widget.hitNotifier,
            ),
          ],
        ),
      ),
    );
  }

  void _generateStationMarkers(List<Departure> departures) {
    _reachableStationsMarkers.clear();
    _reachableStationsTextMarkers.clear();

    final Map<String, dynamic> reachableStations = {};

    for (final departure in departures) {
      for (final station in departure.stops) {
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
      _reachableStationsMarkers.add(
        CircleMarker(
          point: LatLng(
            reachableStations[stationId]['station'].latitude,
            reachableStations[stationId]['station'].longitude,
          ),
          radius: 6,
          color: ColorHelper.interpolateColors(
            WebfabrikTheme.of(context).colors.timelineGradient,
            reachableStations[stationId]['duration'] / 28,
          ).withValues(alpha: .75),
          borderStrokeWidth: 26,
          borderColor: Colors.transparent,
          hitValue: reachableStations[stationId]['station'],
        ),
      );

      _reachableStationsTextMarkers.add(
        Marker(
          point: LatLng(
            reachableStations[stationId]['station'].latitude,
            reachableStations[stationId]['station'].longitude,
          ),

          alignment: Alignment.bottomCenter,
          width: 150,
          height: 55,
          child: Padding(
            padding: EdgeInsets.only(
              top: WebfabrikTheme.of(context).spacing.xSmall,
            ),
            child: Text(
              reachableStations[stationId]['station'].name,
              style: WebfabrikTheme.of(context).text.caption1.copyWith(
                color: Colors.black,
                fontVariations: [FontVariation('wght', 500)],
                shadows: [
                  Shadow(
                    // bottomLeft
                    offset: Offset(-.5, -.5),
                    color: Colors.white,
                  ),
                  Shadow(
                    // bottomRight
                    offset: Offset(.5, -.5),
                    color: Colors.white,
                  ),
                  Shadow(
                    // topRight
                    offset: Offset(.5, .5),
                    color: Colors.white,
                  ),
                  Shadow(
                    // topLeft
                    offset: Offset(-.5, .5),
                    color: Colors.white,
                  ),
                  Shadow(
                    offset: Offset(0, 0),
                    color: Colors.white,
                    blurRadius: 10,
                  ),
                  Shadow(
                    offset: Offset(0, 0),
                    color: Colors.white,
                    blurRadius: 10,
                  ),
                  Shadow(
                    offset: Offset(0, 0),
                    color: Colors.white,
                    blurRadius: 10,
                  ),
                ],
              ),

              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    _updateClusters();

    setState(() {});
  }
}
