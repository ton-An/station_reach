import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

/// {@template search_stations}
/// Searches for stations by name.
///
/// Parameters:
/// - query: Query [String] to search for
///
/// Returns:
/// - [List] of [Station]s found
///
/// Failures:
/// {@macro converted_dio_exceptions}
/// {@endtemplate}
class SearchStations {
  /// {@macro search_stations}
  SearchStations({required this.mapRepository});

  final MapRepository mapRepository;

  /// {@macro search_stations}
  Future<Either<Failure, List<Station>>> call({required String query}) async {
    return _searchStations(query: query);
  }

  Future<Either<Failure, List<Station>>> _searchStations({
    required String query,
  }) async {
    return mapRepository.searchStations(query: query);
  }
}
