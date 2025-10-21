import 'package:dio/dio.dart';
import 'package:station_reach/features/map/domain/models/station.dart';

abstract class MapRemoteDataSource {
  Future<List<Station>> searchStations({required String query});

  Future<List<Map<String, dynamic>>> getStationDepartures({
    required Station station,
  });
}

class MapRemoteDataSourceImpl extends MapRemoteDataSource {
  MapRemoteDataSourceImpl({required this.dio});

  final Dio dio;

  @override
  Future<List<Station>> searchStations({required String query}) async {
    final Uri url = Uri.parse(
      'https://api.transitous.org/api/v1/geocode?text=$query&type=STOP',
    );

    final Response response = await dio.getUri(url);

    final List<Station> stations = response.data
        .map((location) {
          return Station.fromJson(location);
        })
        .toList()
        .cast<Station>();

    return stations;
  }

  @override
  Future<List<Map<String, dynamic>>> getStationDepartures({
    required Station station,
  }) async {
    final String urlString =
        'https://api.transitous.org/api/v5/stoptimes?stopId=${station.id}&n=100&fetchStops=true&radius=200';

    final List<Map<String, dynamic>> departureMaps = [];

    String? nextPageCursor;

    for (int i = 0; i < 10; i++) {
      String computedUrlString = urlString;

      if (nextPageCursor != null && nextPageCursor.isNotEmpty) {
        computedUrlString += '&pageCursor=$nextPageCursor';
      } else if (i > 0 &&
          (nextPageCursor == null || nextPageCursor.isEmpty == true)) {
        break;
      }

      final Response response = await dio.get(computedUrlString);

      departureMaps.addAll(response.data['stopTimes']);
      nextPageCursor = response.data['nextPageCursor'];
    }

    return departureMaps;
  }
}
