import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

/// Base state for the station search cubit
abstract class StationSearchState extends Equatable {
  /// {@macro station_search_state}
  const StationSearchState();

  @override
  List<Object?> get props => [];
}

/// State when the search results are hidden
class StationSearchStateInitial extends StationSearchState {}

/// {@template station_search_data_state}
/// State when the search results are shown
/// {@endtemplate}
abstract class StationSearchDataState extends StationSearchState {
  /// {@macro station_search_data_state}
  const StationSearchDataState({required this.stations});

  final List<Station> stations;

  @override
  List<Object?> get props => [stations];
}

/// {@template station_search_state_loading}
/// State when the search results are loading. Contains the previous search results.
/// {@endtemplate}
class StationSearchStateLoading extends StationSearchDataState {
  /// {@macro station_search_state_loading}
  const StationSearchStateLoading({required super.stations});
}

/// {@template station_search_state_loaded}
/// State when the search results are loaded
/// {@endtemplate}
class StationSearchStateLoaded extends StationSearchDataState {
  /// {@macro station_search_state_loaded}
  const StationSearchStateLoaded({required super.stations});
}

/// {@template station_search_state_failure}
/// State when the search results are failed
/// {@endtemplate}
class StationSearchStateFailure extends StationSearchState {
  /// {@macro station_search_state_failure}
  const StationSearchStateFailure({required this.failure});

  final Failure failure;
}
