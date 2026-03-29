part of 'map_page.dart';

class _Map extends StatefulWidget {
  const _Map();

  @override
  State<_Map> createState() => _MapState();
}

class _MapState extends State<_Map> {
  late MapController mapController;
  late LayerHitNotifier<Stop> hitNotifier;

  @override
  void initState() {
    super.initState();
    mapController = MapController();
    hitNotifier = ValueNotifier(null);
  }

  @override
  void dispose() {
    hitNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<StationDeparturesCubit, StationDeparturesState>(
      listener: (context, state) {
        context.read<StationSelectionCubit>().unselectStation();

        if (state is StationDeparturesLoaded) {
          mapController.move(
            LatLng(state.station.latitude - 1, state.station.longitude),
            6,
          );
        }
      },
      child: FlutterMap(
        mapController: mapController,
        options: MapOptions(
          initialCenter: const LatLng(42.68, 10.127),
          initialZoom: 4,
          minZoom: 1.5,
          onTap: _handleMapTap,
        ),
        children: [
          TileLayer(
            urlTemplate:
                'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
            subdomains: const ['a', 'b', 'c'],
            userAgentPackageName: 'eu.antons-webfabrik.station-reach',
          ),

          _MapStationMarkersLayer(
            hitNotifier: hitNotifier,
            mapController: mapController,
          ),

          const _MapDeparturesPolylineLayer(),
        ],
      ),
    );
  }

  void _handleMapTap(TapPosition tapPosition, LatLng point) {
    final LayerHitResult<Stop>? result = hitNotifier.value;
    if (result == null || result.hitValues.isEmpty) return;
    if (context.read<StationDeparturesCubit>().state
        is! StationDeparturesLoaded) {
      return;
    }
    _onMarkerHit(result.hitValues.first);
  }

  void _onMarkerHit(Stop station) {
    context.read<StationSelectionCubit>().selectStation(
      selectedStop: station,
      departures:
          (context.read<StationDeparturesCubit>().state
                  as StationDeparturesLoaded)
              .departures,
    );
  }
}
