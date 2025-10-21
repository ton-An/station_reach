import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';

class StationSelectionCubit extends Cubit<StationSelectionState> {
  StationSelectionCubit() : super(StationUnselectedState());

  void selectStation({
    required Stop selectedStop,
    required List<Departure> departures,
  }) {
    final List<Departure> highlightedDepartures = [];

    for (final Departure departure in departures) {
      for (final stop in departure.stops) {
        if (stop.id == selectedStop.id) {
          highlightedDepartures.add(departure);
        }
      }
    }

    emit(
      StationSelectedState(
        selectedStop: selectedStop,
        departures: highlightedDepartures,
      ),
    );
  }

  void unselectStation() {
    emit(StationUnselectedState());
  }
}
