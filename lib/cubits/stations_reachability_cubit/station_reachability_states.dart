import 'package:equatable/equatable.dart';
import 'package:station_reach/models/trip.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class StationReachabilityState extends Equatable {
  const StationReachabilityState();

  @override
  List<Object?> get props => [];
}

class StationReachabilityStateInitial extends StationReachabilityState {}

class StationReachabilityStateLoading extends StationReachabilityState {}

class StationReachabilityStateSuccess extends StationReachabilityState {
  const StationReachabilityStateSuccess({required this.trips});

  final List<Trip> trips;

  @override
  List<Object?> get props => [trips];
}

class StationReachabilityStateFailure extends StationReachabilityState {
  const StationReachabilityStateFailure({required this.failure});

  final Failure failure;

  @override
  List<Object?> get props => [failure];
}
