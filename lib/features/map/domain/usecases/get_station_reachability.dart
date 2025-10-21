import 'package:collection/collection.dart';
import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class GetStationDepartures {
  GetStationDepartures({
    required this.mapRepository,
    required this.deepCollectionEquality,
  });

  final MapRepository mapRepository;
  final DeepCollectionEquality deepCollectionEquality;

  Future<Either<Failure, List<Departure>>> call({
    required Station station,
  }) async {
    return _getStationDepartures(station: station);
  }

  Future<Either<Failure, List<Departure>>> _getStationDepartures({
    required Station station,
  }) async {
    final Either<Failure, List<Departure>> departuresEither =
        await mapRepository.getStationDepartures(station: station);

    return departuresEither.fold(
      (Failure failure) => Left(failure),
      (List<Departure> departures) =>
          _filterDuplicateDepartures(station: station, departures: departures),
    );
  }

  Future<Either<Failure, List<Departure>>> _filterDuplicateDepartures({
    required Station station,
    required List<Departure> departures,
  }) async {
    final List<Departure> filteredDepartures = [];

    List<List<Stop>> alreadyFilteredStops = [];

    for (final Departure departure in departures) {
      bool isDuplicate = false;

      for (final List<Stop> stopTime in alreadyFilteredStops) {
        if (deepCollectionEquality.equals(stopTime, departure.stops)) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        alreadyFilteredStops.add(departure.stops);
        filteredDepartures.add(departure);
      }
    }

    return _sortDepartures(departures: filteredDepartures);
  }

  Future<Either<Failure, List<Departure>>> _sortDepartures({
    required List<Departure> departures,
  }) async {
    departures.sort((a, b) {
      if (a.name == b.name) {
        return a.stops.last.duration.compareTo(b.stops.last.duration);
      }

      return a.name.compareTo(b.name);
    });

    return Right(departures);
  }
}
