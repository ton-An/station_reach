import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class GetStationReachability {
  GetStationReachability({required this.mapRepository});

  final MapRepository mapRepository;

  Future<Either<Failure, List<Trip>>> call({required String stationId}) async {
    return mapRepository.getStationReachability(stationId: stationId);
  }
}
