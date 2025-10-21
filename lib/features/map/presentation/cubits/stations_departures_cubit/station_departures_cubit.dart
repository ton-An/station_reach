// https://v6.db.transport.rest/stops/8010159/departures?duration=12220&stopovers=true&profile=dbweb

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/usecases/get_station_reachability.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_departures_cubit/station_departures_states.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class StationDeparturesCubit extends Cubit<StationDeparturesState> {
  StationDeparturesCubit({required this.getStationDepartures})
    : super(StationDeparturesInitial());

  final GetStationDepartures getStationDepartures;

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
