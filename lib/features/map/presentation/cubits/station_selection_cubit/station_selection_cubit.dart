import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart' as geo;
import 'package:maplibre/maplibre.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';

class StationSelectionCubit extends Cubit<StationSelectionState> {
  StationSelectionCubit() : super(StationUnselectedState());

  void selectStation({
    required Position clickedPoint,
    required double metersPerPixel,
    required List<Trip> trips,
  }) {
    final maxDistance = metersPerPixel * 30;

    ReachableStation? highlightedStop;

    List<Trip> highlightedTrips = [];

    for (final Trip trip in trips) {
      for (final stop in trip.stops) {
        final double distance = geo.Geolocator.distanceBetween(
          stop.latitude,
          stop.longitude,
          clickedPoint.lat.toDouble(),
          clickedPoint.lng.toDouble(),
        );

        if (distance < maxDistance) {
          highlightedStop ??= stop;

          if (highlightedStop.id == stop.id) {
            highlightedTrips.add(trip);
          }
        }
      }
    }

    emit(StationSelectedState(trips: highlightedTrips));
  }

  void unselectStation() {
    emit(StationUnselectedState());
  }
}
