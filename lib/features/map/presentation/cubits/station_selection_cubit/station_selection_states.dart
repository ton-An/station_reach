import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';

/// Base state for the station selection cubit
abstract class StationSelectionState extends Equatable {
  /// {@macro station_selection_state}
  const StationSelectionState();

  @override
  List<Object?> get props => [];
}

/// State when no station is selected
class StationUnselectedState extends StationSelectionState {}

/// State when a station is selected
class StationSelectedState extends StationSelectionState {
  /// {@macro station_selected_state}
  const StationSelectedState({
    required this.selectedStop,
    required this.departures,
  });

  final Stop selectedStop;
  final List<Departure> departures;

  @override
  List<Object?> get props => [selectedStop, departures];
}
