// https://v6.db.transport.rest/stops/8010159/departures?duration=12220&stopovers=true&profile=dbweb

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/usecases/get_station_reachability.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_departures_cubit/station_departures_states.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

/// {@template station_departures_cubit}
/// Manages the queries for the departures of a station
///
/// States:
/// - [StationDeparturesInitial]: Initial state
/// - [StationDeparturesLoading]: Loading state
/// - [StationDeparturesLoaded]: Loaded state
/// - [StationDeparturesFailure]: Failure state
/// {@endtemplate}
class StationDeparturesCubit extends Cubit<StationDeparturesState> {
  /// {@macro station_departures_cubit}
  StationDeparturesCubit({required this.getStationDepartures})
    : super(StationDeparturesInitial());

  final GetStationDepartures getStationDepartures;

  /// Gets the departures of a station
  ///
  /// Parameters:
  /// - station: The station to get the departures of
  ///
  /// Emits:
  /// - [StationDeparturesLoading]
  /// - [StationDeparturesLoaded]
  /// - [StationDeparturesFailure]
  Future<void> getReachability(Station station) async {
    emit(StationDeparturesLoading());

    final Either<Failure, List<Departure>> reachabilityEither =
        await getStationDepartures(station: station);

    reachabilityEither.fold(
      (Failure failure) => emit(StationDeparturesFailure(failure: failure)),
      (List<Departure> departures) => emit(
        StationDeparturesLoaded(departures: departures, station: station),
      ),
    );
  }
}
