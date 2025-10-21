import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class StationDeparturesState extends Equatable {
  const StationDeparturesState();

  @override
  List<Object?> get props => [];
}

class StationDeparturesInitial extends StationDeparturesState {}

class StationDeparturesLoading extends StationDeparturesState {}

class StationDeparturesLoaded extends StationDeparturesState {
  const StationDeparturesLoaded({
    required this.departures,
    required this.station,
  });

  final List<Departure> departures;
  final Station station;

  @override
  List<Object?> get props => [departures, station];
}

class StationDeparturesFailure extends StationDeparturesState {
  const StationDeparturesFailure({required this.failure});

  final Failure failure;

  @override
  List<Object?> get props => [failure];
}
