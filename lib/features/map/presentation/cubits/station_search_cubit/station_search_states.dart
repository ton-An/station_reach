import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class StationSearchState extends Equatable {
  @override
  List<Object?> get props => [];
}

class StationSearchStateInitial extends StationSearchState {}

abstract class StationSearchDataState extends StationSearchState {
  StationSearchDataState({required this.stations});

  final List<Station> stations;

  @override
  List<Object?> get props => [stations];
}

class StationSearchStateLoading extends StationSearchDataState {
  StationSearchStateLoading({required super.stations});
}

class StationSearchStateLoaded extends StationSearchDataState {
  StationSearchStateLoaded({required super.stations});
}

class StationSearchStateFailure extends StationSearchState {
  StationSearchStateFailure({required this.failure});

  final Failure failure;

  @override
  List<Object?> get props => [failure];
}
