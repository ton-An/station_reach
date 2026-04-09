import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

/// Base state for the station departures cubit
abstract class StationDeparturesState extends Equatable {
  /// {@macro station_departures_state}
  const StationDeparturesState();

  @override
  List<Object?> get props => [];
}

/// State when no station departures have been loaded yet
class StationDeparturesInitial extends StationDeparturesState {}

/// State when the station departures are being loaded
class StationDeparturesLoading extends StationDeparturesState {}

/// State when the station departures have been loaded
class StationDeparturesLoaded extends StationDeparturesState {
  /// {@macro station_departures_loaded}
  const StationDeparturesLoaded({
    required this.departures,
    required this.station,
  });

  final List<Departure> departures;
  final Station station;

  @override
  List<Object?> get props => [departures, station];
}

/// State when the station departures have failed to load
class StationDeparturesFailure extends StationDeparturesState {
  /// {@macro station_departures_failure}
  const StationDeparturesFailure({required this.failure});

  final Failure failure;

  @override
  List<Object?> get props => [failure];
}
