import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';

class StationSelectionCubit extends Cubit<StationSelectionState> {
  StationSelectionCubit() : super(StationUnselectedState());

  void selectStation({
    required ReachableStation station,
    required List<Departure> trips,
  }) {
    final List<Departure> highlightedTrips = [];

    for (final Departure trip in trips) {
      for (final stop in trip.stops) {
        if (stop.id == station.id) {
          highlightedTrips.add(trip);
        }
      }
    }

    emit(StationSelectedState(station: station, trips: highlightedTrips));
  }

  void unselectStation() {
    emit(StationUnselectedState());
  }
}
