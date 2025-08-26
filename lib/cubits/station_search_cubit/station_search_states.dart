import 'package:equatable/equatable.dart';
import 'package:station_reach/models/station.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class StationSearchState extends Equatable {
  @override
  List<Object?> get props => [];
}

class StationSearchStateInitial extends StationSearchState {}

class StationSearchStateLoading extends StationSearchState {}

class StationSearchStateSuccess extends StationSearchState {
  StationSearchStateSuccess({required this.stations});

  final List<Station> stations;

  @override
  List<Object?> get props => [stations];
}

class StationSearchStateFailure extends StationSearchState {
  StationSearchStateFailure({required this.failure});

  final Failure failure;

  @override
  List<Object?> get props => [failure];
}
