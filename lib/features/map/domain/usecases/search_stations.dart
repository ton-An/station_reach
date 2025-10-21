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
    final Either<Failure, List> stationMapsEither = await mapRepository
        .searchStations(query: query);

    return stationMapsEither.fold(
      (failure) => Left(failure),
      (stationMaps) => _convertToStationModels(stationMaps: stationMaps),
    );
  }

  Future<Either<Failure, List<Station>>> _convertToStationModels({
    required List stationMaps,
  }) async {
    final List<Station> stations = [];

    for (final Map stationMap in stationMaps) {
      final String id = stationMap['id'];
      final String name = stationMap['name'];
      final double latitude = stationMap['lat'];
      final double longitude = stationMap['lon'];
      String? area;
      String? countryCode;

      adminLevelLoop:
      for (double adminLevel = 7; adminLevel >= 0; adminLevel--) {
        for (final Map stationArea in stationMap['areas']) {
          if (stationArea['adminLevel'] == adminLevel) {
            area = stationArea['name'];
            break adminLevelLoop;
          }
        }
      }

      final Station station = Station(
        id: id,
        name: name,
        latitude: latitude,
        longitude: longitude,
        area: area,
        countryCode: countryCode,
      );

      stations.add(station);
    }

    return Right(stations);
  }
}
