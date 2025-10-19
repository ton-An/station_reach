import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class GetStationReachability {
  GetStationReachability({required this.mapRepository});

  final MapRepository mapRepository;

  Future<Either<Failure, List<Trip>>> call({required Station station}) async {
    return _getStationsReachability(station: station);
  }

  Future<Either<Failure, List<Trip>>> _getStationsReachability({
    required Station station,
  }) async {
    final Either<Failure, List<Trip>> tripsEither = await mapRepository
        .getStationReachability(station: station);

    return tripsEither.fold(
      (failure) => Left(failure),
      (trips) => _sortTrips(trips: trips),
    );
  }

  Future<Either<Failure, List<Trip>>> _sortTrips({
    required List<Trip> trips,
  }) async {
    trips.sort((a, b) {
      if (a.name == b.name) {
        return a.stops.last.duration.compareTo(b.stops.last.duration);
      }

      return a.name.compareTo(b.name);
    });

    return Right(trips);
  }
}
