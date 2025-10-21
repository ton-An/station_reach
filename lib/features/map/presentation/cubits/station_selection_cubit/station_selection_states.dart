import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';

abstract class StationSelectionState extends Equatable {
  @override
  List<Object?> get props => [];
}

class StationUnselectedState extends StationSelectionState {}

class StationSelectedState extends StationSelectionState {
  StationSelectedState({required this.selectedStop, required this.departures});

  final Stop selectedStop;
  final List<Departure> departures;

  @override
  List<Object?> get props => [selectedStop, departures];
}
