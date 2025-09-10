import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';

abstract class TripsSelectionState extends Equatable {
  @override
  List<Object?> get props => [];
}

class TripsUnselectedState extends TripsSelectionState {}

class TripsSelectedState extends TripsSelectionState {
  TripsSelectedState({required this.trips});

  final List<Trip> trips;

  @override
  List<Object?> get props => [trips];
}
