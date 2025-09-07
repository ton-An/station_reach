import 'package:station_reach/features/map/domain/models/station.dart';

abstract class MapRemoteDataSource {
  Future<List<Station>> searchStations({required String query});
}
