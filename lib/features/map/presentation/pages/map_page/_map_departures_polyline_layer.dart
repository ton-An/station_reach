part of 'map_page.dart';

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

  void _generateDeparturePolylines(List<Departure> departures) {
    _departurePolylines.clear();

    for (final departure in departures) {
      final Color color = ColorHelper.interpolateColors(
        WebfabrikTheme.of(context).colors.secondaryGradient,
        departures.indexOf(departure) / max(departures.length - 1, 1),
      ).withValues(alpha: .7);

      _departurePolylines.insert(
        0,
        Polyline(
          points: [
            for (final stop in departure.stops)
              LatLng(stop.latitude, stop.longitude),
          ],
          strokeWidth: 5,
          strokeCap: StrokeCap.round,
          strokeJoin: StrokeJoin.round,
          color: color,
        ),
      );
    }
    setState(() {});
  }
}
