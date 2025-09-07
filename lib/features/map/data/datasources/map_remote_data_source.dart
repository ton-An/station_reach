import 'package:dio/dio.dart';
import 'package:station_reach/core/constants.dart';
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
  Future<List<Trip>> getStationReachability({required Station station}) async {
    const String query = '''
query (\$stopIds: [String!]!, \$start: Long!, \$range: Int!) {
  stops(ids: \$stopIds) {
    gtfsId
    name
    stoptimesForPatterns(
      startTime: \$start
      timeRange: \$range
      numberOfDepartures: 1
      omitNonPickups: false
    ) {
      pattern {
        id
        route {
          shortName
          mode
          type
          agency { id name }
        }
      }
      stoptimes {
        serviceDay
        scheduledDeparture
        scheduledArrival
        headsign
        trip {
          gtfsId
          stoptimes {
            stop { gtfsId name lat lon }
            scheduledArrival
          }
        }
      }
    }
  }
}
''';

    final Uri url = Uri.parse('${Constants.otpUrl}gtfs/v1');

    final Map<String, dynamic> queryVariables = {
      'stopIds': [station.id, ...station.childrenIds],
      'start': 0,
      'range': 86400,
    };

    final Response response = await dio.postUri(
      url,
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
      data: {'query': query, 'variables': queryVariables},
    );

    List stations = response.data['data']['stops'] as List;

    stations.removeWhere((station) => station == null);

    final List<Trip> trips = [];

    for (final Map station in stations) {
      for (final Map stoptimesForPattern in station['stoptimesForPatterns']) {
        trips.add(Trip.fromJson(stoptimesForPattern));
      }
    }

    return trips;
  }
}
