import 'package:dio/dio.dart';
import 'package:station_reach/core/failures/transit/no_departures_found_failure.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';

abstract class MapRemoteDataSource {
  /// Queries the Transitous API to search for stations by name.
  ///
  /// Parameters:
  /// - query: Query [String] to search for
  ///
  /// Returns:
  /// - [List] of [Station]s found
  ///
  /// Throws:
  /// - [DioException]
  Future<List<Station>> searchStations({required String query});

  /// Queries the Transitous API to get the departures for a station by mode.
  ///
  /// ! Note: This method contains a complicated workaround to handle the case where
  /// the api returns 'Departure is last stop in trip' error which is a bug in MOTIS.
  ///
  /// Parameters:
  /// - station: [Station] to get the departures for
  /// - modes: [List] of [TransitMode]s to get the departures for
  /// - requestCount: [int] number of requests to make
  ///
  /// Returns:
  /// - [List] of [Departure]s found
  ///
  /// Throws:
  /// - [NoDeparturesFoundFailure]
  /// - [DioException]
  Future<List<Departure>> getStationDeparturesByMode({
    required Station station,
    required List<TransitMode> modes,
    required int requestCount,
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

    final List stationMaps = response.data;

    final List<Station> stations = [];

    for (final Map stationMap in stationMaps) {
      final Station station = await _convertToStationModel(
        stationMap: stationMap,
      );

      stations.add(station);
    }

    return stations;
  }

  @override
  Future<List<Departure>> getStationDeparturesByMode({
    required Station station,
    required List<TransitMode> modes,
    required int requestCount,
  }) async {
    final String modeString = modes.map((mode) => mode.toString()).join(',');

    final DateTime now = DateTime.now().toUtc();
    final String nowIsoString = now.toIso8601String();

    final String urlString =
        'https://api.transitous.org/api/v5/stoptimes?stopId=${station.id}&n=100&fetchStops=true&radius=200&mode=${modeString}&withScheduledSkippedStops=true';

    final List departureMaps = [];

    String? nextPageCursor;
    DateTime? lastStopTime;
    int lastStopErrorCount = 0;
    bool hadLastStopErrorLastIteration = false;

    for (int i = 0; i < requestCount + lastStopErrorCount; i++) {
      try {
        String computedUrlString = urlString;

        if (nextPageCursor != null && nextPageCursor.isNotEmpty) {
          computedUrlString += '&pageCursor=$nextPageCursor';
        } else if (i > 0 &&
            !hadLastStopErrorLastIteration &&
            (nextPageCursor == null || nextPageCursor.isEmpty == true)) {
          break;
        }

        if (hadLastStopErrorLastIteration) {
          computedUrlString +=
              '&time=${lastStopTime!.toUtc().toIso8601String()}';
        } else {
          computedUrlString += '&time=$nowIsoString';
        }

        final Response response = await dio.get(computedUrlString);

        nextPageCursor = response.data['nextPageCursor'];

        if (nextPageCursor == null || nextPageCursor.isEmpty) {
          throw const NoDeparturesFoundFailure();
        }

        departureMaps.addAll(response.data['stopTimes']);
        lastStopTime = DateTime.parse(
          response.data['stopTimes'].last['place']['scheduledDeparture'],
        ).toUtc();
        hadLastStopErrorLastIteration = false;
      } on DioException catch (e) {
        if (e.response?.data['error'] == 'Departure is last stop in trip') {
          if (lastStopTime == null) {
            lastStopTime ??= now.add(const Duration(hours: 1));
          } else if (hadLastStopErrorLastIteration) {
            lastStopTime = lastStopTime.add(const Duration(hours: 1));
          }

          if (lastStopErrorCount < 10) {
            lastStopErrorCount++;
          }

          nextPageCursor = null;
          hadLastStopErrorLastIteration = true;

          continue;
        }

        rethrow;
      }
    }

    final List<Departure> departures = [];

    for (final Map departureMap in departureMaps) {
      departures.add(
        _convertToDepartureModel(station: station, departureMap: departureMap),
      );
    }

    return departures;
  }

  Future<Station> _convertToStationModel({required Map stationMap}) async {
    final String id = stationMap['id'];
    final String name = stationMap['name'];
    final double latitude = stationMap['lat'];
    final double longitude = stationMap['lon'];
    final String? countryCode = stationMap['country'];
    String? area;

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

    return station;
  }

  Departure _convertToDepartureModel({
    required Station station,
    required Map departureMap,
  }) {
    final String id = departureMap['tripId'];
    late final String name;

    if (departureMap['displayName'] != null) {
      name = departureMap['displayName'];
    } else if (departureMap['routeShortName'] != null) {
      name = departureMap['routeShortName'];
    } else if (departureMap['tripShortName'] != null) {
      name = departureMap['tripShortName'];
    } else {
      name = departureMap['routeLongName'];
    }

    final TransitMode mode = TransitMode.fromString(departureMap['mode']);

    final List<Stop> stops = [];

    stops.add(
      Stop(
        id: station.id,
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        duration: Duration.zero,
      ),
    );

    final DateTime departureTime = DateTime.parse(
      departureMap['place']['scheduledDeparture'],
    );

    final List stopMaps = departureMap['nextStops'];

    for (final Map stopMap in stopMaps) {
      final String stopId = stopMap['stopId'];
      final String stopName = stopMap['name'];
      final double stopLatitude = stopMap['lat'];
      final double stopLongitude = stopMap['lon'];

      final String? scheduledArrivalString =
          stopMap['scheduledArrival'] ?? stopMap['scheduledDeparture'];
      if (scheduledArrivalString == null) {
        continue;
      }

      final DateTime scheduledArrival = DateTime.parse(scheduledArrivalString);

      final Duration duration = scheduledArrival.difference(departureTime);

      stops.add(
        Stop(
          id: stopId,
          name: stopName,
          latitude: stopLatitude,
          longitude: stopLongitude,
          duration: duration,
        ),
      );
    }

    final Departure departure = Departure(
      id: id,
      name: name,
      mode: mode,
      stops: stops,
    );

    return departure;
  }
}
