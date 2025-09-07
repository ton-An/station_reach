import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class MapRepository {
  Future<Either<Failure, List<Station>>> searchStations({
    required String query,
  });

  Future<Either<Failure, List<Trip>>> getStationReachability({
    required String stationId,
  });
}
