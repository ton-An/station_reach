import 'package:collection/collection.dart';
import 'package:dio/dio.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';

abstract class MapRemoteDataSource {
  Future<List<Station>> searchStations({required String query});

  Future<List<Trip>> getStationReachability({required Station station});
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
  Future<List<Trip>> getStationReachability({required Station station}) async {
    final Uri url = Uri.parse(
      'https://api.transitous.org/api/v5/stoptimes?stopId=${station.id}&n=1000&fetchStops=true',
    );

    final Response response = await dio.getUri(url);

    final List<Trip> trips = [];
    final listEquality = const DeepCollectionEquality().equals;

    List<List<ReachableStation>> stopTimes = [];

    for (final Map tripMap in response.data['stopTimes']) {
      final Trip trip = Trip.fromJson(tripMap, station);

      bool isDuplicate = false;
      for (final List<ReachableStation> stopTime in stopTimes) {
        if (listEquality(stopTime, trip.stops)) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        stopTimes.add(trip.stops);
        trips.add(trip);
      }
    }

    return trips;
  }
}
