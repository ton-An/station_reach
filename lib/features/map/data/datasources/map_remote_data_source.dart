import 'package:dio/dio.dart';
import 'package:station_reach/core/constants.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';

abstract class MapRemoteDataSource {
  Future<List<Station>> searchStations({required String query});

  Future<List<Trip>> getStationReachability({required String stationId});
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

    final List<Station> stations = response.data
        .map((location) {
          return Station.fromJson(location);
        })
        .toList()
        .cast<Station>();

    return stations;
  }

  @override
  Future<List<Trip>> getStationReachability({required String stationId}) {
    // TODO: implement getStationReachability
    throw UnimplementedError();
  }
}
