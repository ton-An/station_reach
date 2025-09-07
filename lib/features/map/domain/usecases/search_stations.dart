import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class SearchStations {
  SearchStations({required this.mapRepository});

  final MapRepository mapRepository;

  Future<Either<Failure, List<Station>>> call({required String query}) async {
    return _filterQuery(query: query);
  }

  Future<Either<Failure, List<Station>>> _filterQuery({
    required String query,
  }) async {
    final RegExp queryFilter = RegExp(
      r'([+ - && || ! ( ) { } \[ \] ^ " ~ * ? : \\ /])',
    );

    final String filteredQuery = query.replaceAll(queryFilter, '');

    if (filteredQuery.isEmpty) {
      return const Right([]);
    }

    return _searchStations(query: filteredQuery);
  }

  Future<Either<Failure, List<Station>>> _searchStations({
    required String query,
  }) async {
    return mapRepository.searchStations(query: query);
  }
}
