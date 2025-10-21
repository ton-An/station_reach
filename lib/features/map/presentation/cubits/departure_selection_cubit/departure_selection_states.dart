import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';

abstract class DepartureSelectionState extends Equatable {
  @override
  List<Object?> get props => [];
}

class NoDepartureSelected extends DepartureSelectionState {}

class DepartureSelected extends DepartureSelectionState {
  DepartureSelected({required this.departure});

  final Departure departure;

  @override
  List<Object?> get props => [departure];
}
