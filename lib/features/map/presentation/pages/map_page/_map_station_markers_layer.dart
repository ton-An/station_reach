part of 'map_page.dart';

class _MapStationMarkersLayer extends StatefulWidget {
  const _MapStationMarkersLayer({required this.hitNotifier});

  final LayerHitNotifier<Stop> hitNotifier;

  @override
  State<_MapStationMarkersLayer> createState() =>
      _MapStationMarkersLayerState();
}

class _MapStationMarkersLayerState extends State<_MapStationMarkersLayer> {
  final List<CircleMarker<Stop>> _reachableStationsLayers = [];

  @override
  Widget build(BuildContext context) {
    return BlocListener<StationDeparturesCubit, StationDeparturesState>(
      listener: (context, state) {
        if (state is StationDeparturesLoaded) {
          _generateStationMarkers(state.departures);
        }
      },
      child: TranslucentPointer(
        child: CircleLayer(
          circles: _reachableStationsLayers,
          hitNotifier: widget.hitNotifier,
        ),
      ),
    );
  }

  void _generateStationMarkers(List<Departure> departures) {
    _reachableStationsLayers.clear();

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
}
