// https://v6.db.transport.rest/stops/8010159/departures?duration=12220&stopovers=true&profile=dbweb

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/usecases/get_station_reachability.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_reachability_cubit/station_reachability_states.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class StationReachabilityCubit extends Cubit<StationReachabilityState> {
  StationReachabilityCubit({required this.getStationDepartures})
    : super(StationReachabilityStateInitial());

  final GetStationDepartures getStationDepartures;

  Future<void> getReachability(Station station) async {
    emit(StationReachabilityStateLoading());

    final Either<Failure, List<Departure>> reachabilityEither =
        await getStationDepartures(station: station);

    reachabilityEither.fold(
      (failure) => emit(StationReachabilityStateFailure(failure: failure)),
      (trips) => emit(
        StationReachabilityStateSuccess(departures: trips, station: station),
      ),
    );
  }
}
