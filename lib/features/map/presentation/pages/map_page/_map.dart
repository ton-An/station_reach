part of 'map_page.dart';

class _Map extends StatefulWidget {
  const _Map();

  @override
  State<_Map> createState() => _MapState();
}

class _MapState extends State<_Map> {
  late MapController mapController;
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
            context.read<StationDeparturesCubit>().state
                is StationDeparturesLoaded) {
          _hitStation = result.hitValues.first;
        }
      });
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
          onMapEvent: (event) {
            if (event is MapEventMove) {
              _hitStation = null;
            }
          },
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            subdomains: const ['a', 'b', 'c'],
            userAgentPackageName: 'eu.antons-webfabrik.station-reach',
          ),

          _MapStationMarkersLayer(hitNotifier: hitNotifier),

          RawGestureDetector(
            behavior: HitTestBehavior.translucent,
            gestures: <Type, GestureRecognizerFactory>{
              TapGestureRecognizer:
                  GestureRecognizerFactoryWithHandlers<TapGestureRecognizer>(
                    () => TapGestureRecognizer(),
                    (r) {
                      r.onTap = () {
                        if (_hitStation != null) {
                          _onMarkerHit();
                        }
                      };
                    },
                  ),
            },
          ),

          const _MapDeparturesPolylineLayer(),
        ],
      ),
    );
  }

  void _onMarkerHit() {
    context.read<StationSelectionCubit>().selectStation(
      selectedStop: _hitStation!,
      departures:
          (context.read<StationDeparturesCubit>().state
                  as StationDeparturesLoaded)
              .departures,
    );
  }
}
