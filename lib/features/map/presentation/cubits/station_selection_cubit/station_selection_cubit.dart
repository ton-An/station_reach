import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';

/// {@template station_selection_cubit}
/// Manages the selection of a station
///
/// States:
/// - [StationUnselectedState]: Unselected state
/// - [StationSelectedState]: Selected state
/// {@endtemplate}
class StationSelectionCubit extends Cubit<StationSelectionState> {
  /// {@macro station_selection_cubit}
  StationSelectionCubit() : super(StationUnselectedState());

  /// Selects a station
  ///
  /// Parameters:
  /// - selectedStop: The selected stop
  /// - departures: The departures
  ///
  /// Emits:
  /// - [StationSelectedState]
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

  /// Unselects the selected station
  ///
  /// Emits:
  /// - [StationUnselectedState]
  void unselectStation() {
    emit(StationUnselectedState());
  }
}
