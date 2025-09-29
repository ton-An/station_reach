import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';

class StationSelectionCubit extends Cubit<StationSelectionState> {
  StationSelectionCubit() : super(StationUnselectedState());

  void selectStation({
    required ReachableStation station,
    required List<Trip> trips,
  }) {
    final List<Trip> highlightedTrips = [];

    for (final Trip trip in trips) {
      for (final stop in trip.stops) {
        if (stop.id == station.id) {
          highlightedTrips.add(trip);
        }
      }
    }

    emit(StationSelectedState(trips: highlightedTrips));
  }

  void unselectStation() {
    emit(StationUnselectedState());
  }
}
