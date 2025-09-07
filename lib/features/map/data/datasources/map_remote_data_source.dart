import 'package:dio/dio.dart';
import 'package:station_reach/core/constants.dart';
import 'package:station_reach/features/map/domain/models/station.dart';

abstract class MapRemoteDataSource {
  Future<List<Station>> searchStations({required String query});
}

class MapRemoteDataSourceImpl extends MapRemoteDataSource {
  MapRemoteDataSourceImpl({required this.dio});

  final Dio dio;

  @override
  Future<List<Station>> searchStations({required String query}) async {
    final Uri url = Uri.parse(
      '${Constants.otpUrl}geocode/stopClusters?query=$query',
    );

    final Response response = await dio.getUri(url);

    final List<Station> stations = response.data.map((location) {
      return Station.fromJson(location);
    }).toList();

    return stations;
  }
}
