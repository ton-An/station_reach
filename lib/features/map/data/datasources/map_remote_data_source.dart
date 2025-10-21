import 'package:dio/dio.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';

abstract class MapRemoteDataSource {
  Future<List<Station>> searchStations({required String query});

  Future<List<Departure>> getStationDepartures({required Station station});
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

  @override
  Future<List<Departure>> getStationDepartures({
    required Station station,
  }) async {
    final String urlString =
        'https://api.transitous.org/api/v5/stoptimes?stopId=${station.id}&n=100&fetchStops=true&radius=200';

    final List departureMaps = [];

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

    final List<Departure> departures = [];

    for (final Map departureMap in departureMaps) {
      departures.add(
        _convertToDepartureModel(station: station, departureMap: departureMap),
      );
    }

    return departures;
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

      final DateTime scheduledArrival = DateTime.parse(
        stopMap['scheduledArrival'],
      );

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
