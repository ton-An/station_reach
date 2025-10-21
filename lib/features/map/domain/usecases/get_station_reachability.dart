import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class GetStationDepartures {
  GetStationDepartures({required this.mapRepository});

  final MapRepository mapRepository;

  Future<Either<Failure, List<Departure>>> call({
    required Station station,
  }) async {
    return _getStationDepartures(station: station);
  }

  Future<Either<Failure, List<Departure>>> _getStationDepartures({
    required Station station,
  }) async {
    final Either<Failure, List<Map<String, dynamic>>> departuresEither =
        await mapRepository.getStationDepartures(station: station);

    return departuresEither.fold(
      (failure) => Left(failure),
      (departures) => _convertToDepartureModels(departures: departures),
    );
  }

  Future<Either<Failure, List<Departure>>> _convertToDepartureModels({
    required List<Map<String, dynamic>> departures,
  }) async {
    return _sortDepartures(departures: []);
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
