import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart' as geo;
import 'package:maplibre/maplibre.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';
import 'package:station_reach/features/map/presentation/cubits/trips_selection_cubit/trips_selection_states.dart';

class TripsSelectionCubit extends Cubit<TripsSelectionState> {
  TripsSelectionCubit() : super(TripsUnselectedState());

  void selectTrips({
    required Position clickedPoint,
    required double metersPerPixel,
    required List<Trip> trips,
  }) {
    final maxDistance = metersPerPixel * 10;

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

    emit(TripsSelectedState(trips: highlightedTrips));
  }

  void unselectTrips() {
    emit(TripsUnselectedState());
  }
}
