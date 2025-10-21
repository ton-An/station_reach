import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class SearchStations {
  SearchStations({required this.mapRepository});

  final MapRepository mapRepository;

  Future<Either<Failure, List<Station>>> call({required String query}) async {
    return _searchStations(query: query);
  }

  Future<Either<Failure, List<Station>>> _searchStations({
    required String query,
  }) async {
    return mapRepository.searchStations(query: query);
  }
}
