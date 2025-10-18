import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';

abstract class StationSelectionState extends Equatable {
  @override
  List<Object?> get props => [];
}

class StationUnselectedState extends StationSelectionState {}

class StationSelectedState extends StationSelectionState {
  StationSelectedState({required this.station, required this.trips});

  final ReachableStation station;
  final List<Trip> trips;

  @override
  List<Object?> get props => [trips];
}
