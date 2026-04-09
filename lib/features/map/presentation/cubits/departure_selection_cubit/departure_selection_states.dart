import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';

/// Base state for the departure selection cubit
abstract class DepartureSelectionState extends Equatable {
  /// {@macro departure_selection_state}
  const DepartureSelectionState();

  @override
  List<Object?> get props => [];
}

/// State when no departure in the modal is selected
class NoDepartureSelected extends DepartureSelectionState {}

/// State when a departure in the modal is selected
class DepartureSelected extends DepartureSelectionState {
  /// {@macro departure_selected}
  const DepartureSelected({required this.departure});

  /// The selected departure
  final Departure departure;

  @override
  List<Object?> get props => [departure];
}
