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

  Map<TransitMode, int> _transitModeMap = {
    TransitMode.walk: 0,
    TransitMode.bike: 0,
    TransitMode.rental: 0,
    TransitMode.car: 0,
    TransitMode.carParking: 0,
    TransitMode.carDropoff: 0,
    TransitMode.odm: 0,
    TransitMode.flex: 0,
    TransitMode.transit: 0,
    TransitMode.tram: 0,
    TransitMode.subway: 0,
    TransitMode.ferry: 0,
    TransitMode.airplane: 0,
    TransitMode.suburban: 0,
    TransitMode.bus: 0,
    TransitMode.coach: 0,
    TransitMode.rail: 0,
    TransitMode.highspeedRail: 0,
    TransitMode.longDistance: 0,
    TransitMode.nightRail: 0,
    TransitMode.regionalFastRail: 0,
    TransitMode.regionalRail: 0,
    TransitMode.cableCar: 0,
    TransitMode.funicular: 0,
    TransitMode.aerialLift: 0,
    TransitMode.arealLift: 0,
    TransitMode.metro: 0,
    TransitMode.other: 0,
  };

  Map<TransitMode, int> _transitModeResetMap = {
    TransitMode.walk: 0,
    TransitMode.bike: 0,
    TransitMode.rental: 0,
    TransitMode.car: 0,
    TransitMode.carParking: 0,
    TransitMode.carDropoff: 0,
    TransitMode.odm: 0,
    TransitMode.flex: 0,
    TransitMode.transit: 0,
    TransitMode.tram: 0,
    TransitMode.subway: 0,
    TransitMode.ferry: 0,
    TransitMode.airplane: 0,
    TransitMode.suburban: 0,
    TransitMode.bus: 0,
    TransitMode.coach: 0,
    TransitMode.rail: 0,
    TransitMode.highspeedRail: 0,
    TransitMode.longDistance: 0,
    TransitMode.nightRail: 0,
    TransitMode.regionalFastRail: 0,
    TransitMode.regionalRail: 0,
    TransitMode.cableCar: 0,
    TransitMode.funicular: 0,
    TransitMode.aerialLift: 0,
    TransitMode.arealLift: 0,
    TransitMode.metro: 0,
    TransitMode.other: 0,
  };

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
    List<Departure> remoteDepartures = await _getDeparturesByMode(
      station: station,
      modes: [
        TransitMode.coach,
        TransitMode.highspeedRail,
        TransitMode.longDistance,
        TransitMode.nightRail,
      ],
      pageCount: 10,
    );

    List<Departure> localDepartures = await _getDeparturesByMode(
      station: station,
      modes: [
        TransitMode.tram,
        TransitMode.subway,
        TransitMode.suburban,
        TransitMode.bus,
        TransitMode.regionalFastRail,
        TransitMode.regionalRail,
        TransitMode.cableCar,
        TransitMode.funicular,
        TransitMode.aerialLift,
        TransitMode.arealLift,
        TransitMode.metro,
      ],
      pageCount: 6,
    );

    return [...remoteDepartures, ...localDepartures];
  }

  @override
  Future<List<Departure>> _getDeparturesByMode({
    required Station station,
    required List<TransitMode> modes,
    required int pageCount,
  }) async {
    final String modeString = modes.map((mode) => mode.toString()).join(',');

    final String urlString =
        'https://api.transitous.org/api/v5/stoptimes?stopId=${station.id}&n=100&fetchStops=true&radius=200&mode=${modes.join(',')}';

    final List departureMaps = [];

    _transitModeMap = _transitModeResetMap;

    String? nextPageCursor;

    for (int i = 0; i < pageCount; i++) {
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

    _transitModeMap[mode] = _transitModeMap[mode]! + 1;

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
