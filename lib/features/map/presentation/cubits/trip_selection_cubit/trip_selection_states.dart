import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';

abstract class TripSelectionState extends Equatable {
  @override
  List<Object?> get props => [];
}

class TripSelectionStateUnselected extends TripSelectionState {}

class TripSelectionStateSelected extends TripSelectionState {
  TripSelectionStateSelected({required this.trip});

  final Trip trip;

  @override
  List<Object?> get props => [trip];
}
