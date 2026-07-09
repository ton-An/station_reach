part of 'map_page.dart';

/// A layer that displays polylines representing departure routes on the map.
///
/// It listens to [StationSelectionCubit] to draw polylines when a station is selected.
/// Polylines are color-coded by travel duration between stops.
class _MapDeparturesPolylineLayer extends StatefulWidget {
  const _MapDeparturesPolylineLayer();

  @override
  State<_MapDeparturesPolylineLayer> createState() =>
      _MapDeparturesPolylineLayerState();
}

class _MapDeparturesPolylineLayerState
    extends State<_MapDeparturesPolylineLayer> {
  final List<Polyline> _departurePolylines = [];

  @override
  Widget build(BuildContext context) {
    return BlocListener<StationDeparturesCubit, StationDeparturesState>(
      listener: (context, state) {
        if (state is StationDeparturesLoaded) {
          setState(() {
            _departurePolylines.clear();
          });
        }
      },
      child: BlocListener<StationSelectionCubit, StationSelectionState>(
        listener: (context, state) {
          if (state is StationSelectedState) {
            _generateDeparturePolylines(state.departures);
          }
        },
        child: TranslucentPointer(
          child: MultiPolylineLayer(polylines: _departurePolylines),
        ),
      ),
    );
  }

  /// Generates polylines for the provided [departures].
  ///
  /// Each segment is color-coded using the same travel-duration gradient as
  /// station markers.
  void _generateDeparturePolylines(List<Departure> departures) {
    _departurePolylines.clear();

    for (final departure in departures) {
      for (int i = 0; i < departure.stops.length - 1; i++) {
        final currentStop = departure.stops[i];
        final nextStop = departure.stops[i + 1];
        final durationToNextStation = nextStop.duration - currentStop.duration;
        final durationIn30Minutes = (durationToNextStation.inMinutes ~/ 30)
            .clamp(0, 28);

        final Color color = ColorHelper.interpolateColors(
          WebfabrikTheme.of(context).colors.timelineGradient,
          durationIn30Minutes / 28,
        ).withValues(alpha: .7);

        _departurePolylines.insert(
          0,
          Polyline(
            points: [
              LatLng(currentStop.latitude, currentStop.longitude),
              LatLng(nextStop.latitude, nextStop.longitude),
            ],
            strokeWidth: 5,
            strokeCap: StrokeCap.round,
            strokeJoin: StrokeJoin.round,
            color: color,
            hitValue: departure.id,
          ),
        );
      }
    }
    setState(() {});
  }
}
