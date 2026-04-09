part of 'map_page.dart';

/// The core map component of the [MapPage].
///
/// It handles map interactions, tile rendering, and manages the layers for
/// station markers and departure polylines.
///
/// It uses [MapController] for programmatic map movement and [LayerHitNotifier]
/// for handling marker taps.
class _Map extends StatefulWidget {
  const _Map();

  @override
  State<_Map> createState() => _MapState();
}

class _MapState extends State<_Map> with SingleTickerProviderStateMixin {
  late MapController mapController;
  late LayerHitNotifier<Stop> hitNotifier;
  late AnimationController _doubleTapZoomController;

  Animation<LatLng>? _doubleTapCenterAnimation;
  Animation<double>? _doubleTapZoomAnimation;

  DateTime? _lastTapTime;
  Offset? _lastTapGlobal;

  static const Duration _doubleTapWindow = Duration(milliseconds: 250);
  static const double _doubleTapSlop = 48;
  static const Duration _doubleTapZoomDuration = Duration(milliseconds: 200);
  static const Curve _doubleTapZoomCurve = Curves.fastOutSlowIn;

  @override
  void initState() {
    super.initState();
    mapController = MapController();
    hitNotifier = ValueNotifier(null);
    _doubleTapZoomController = AnimationController(
      vsync: this,
      duration: _doubleTapZoomDuration,
    )..addListener(_tickDoubleTapZoomAnimation);
  }

  @override
  void dispose() {
    _doubleTapZoomController
      ..removeListener(_tickDoubleTapZoomAnimation)
      ..dispose();
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
      child: Listener(
        onPointerSignal: (pointerSignal) {
          if (pointerSignal is PointerScaleEvent) {
            mapController.move(
              mapController.camera.center,
              mapController.camera.zoom + (pointerSignal.scale - 1) * 2,
            );
          }
        },
        child: FlutterMap(
          mapController: mapController,
          options: MapOptions(
            initialCenter: const LatLng(42.68, 10.127),
            initialZoom: 4,
            minZoom: 1.5,
            interactionOptions: const InteractionOptions(
              flags: InteractiveFlag.all & ~InteractiveFlag.doubleTapZoom,
            ),
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
      ),
    );
  }

  /// Updates the map camera during a double-tap zoom animation.
  void _tickDoubleTapZoomAnimation() {
    final Animation<LatLng>? center = _doubleTapCenterAnimation;
    final Animation<double>? zoom = _doubleTapZoomAnimation;
    if (center == null || zoom == null) return;
    mapController.move(center.value, zoom.value);
  }

  /// Handles tap events on the map, detecting double-taps for zooming
  /// and single-taps for marker selection.
  void _handleMapTap(TapPosition tapPosition, LatLng point) {
    final DateTime now = DateTime.now();
    final Offset global = tapPosition.global;
    final DateTime? lastTime = _lastTapTime;
    final Offset? lastGlobal = _lastTapGlobal;
    final bool isDoubleTap =
        lastTime != null &&
        lastGlobal != null &&
        now.difference(lastTime) <= _doubleTapWindow &&
        (global - lastGlobal).distance <= _doubleTapSlop;

    if (isDoubleTap) {
      _lastTapTime = null;
      _lastTapGlobal = null;
      _handleDoubleTapZoom(tapPosition);
      return;
    }

    _lastTapTime = now;
    _lastTapGlobal = global;

    final LayerHitResult<Stop>? result = hitNotifier.value;
    if (result == null || result.hitValues.isEmpty) return;
    if (context.read<StationDeparturesCubit>().state
        is! StationDeparturesLoaded) {
      return;
    }
    _onMarkerHit(result.hitValues.first);
  }

  /// Initiates a smooth zoom animation to the tapped location.
  void _handleDoubleTapZoom(TapPosition tapPosition) {
    final Offset? relative = tapPosition.relative;
    if (relative == null) return;

    _doubleTapZoomController.stop();

    final MapCamera camera = mapController.camera;
    const double scale = 2;
    final double newZoom = camera.clampZoom(camera.zoom + log(scale) / ln2);
    final LatLng newCenter = camera.focusedZoomCenter(relative, newZoom);

    final CurveTween curve = CurveTween(curve: _doubleTapZoomCurve);
    _doubleTapZoomAnimation = Tween<double>(
      begin: camera.zoom,
      end: newZoom,
    ).chain(curve).animate(_doubleTapZoomController);
    _doubleTapCenterAnimation = LatLngTween(
      begin: camera.center,
      end: newCenter,
    ).chain(curve).animate(_doubleTapZoomController);

    _doubleTapZoomController.forward(from: 0);
  }

  /// Selects a station and its departures when a marker is hit.
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
