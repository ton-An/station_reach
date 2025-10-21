import 'package:collection/collection.dart';
import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class GetStationDepartures {
  GetStationDepartures({
    required this.mapRepository,
    required this.deepCollectionEquality,
  });

  final MapRepository mapRepository;
  final DeepCollectionEquality deepCollectionEquality;

  Future<Either<Failure, List<Departure>>> call({
    required Station station,
  }) async {
    return _getStationDepartures(station: station);
  }

  Future<Either<Failure, List<Departure>>> _getStationDepartures({
    required Station station,
  }) async {
    final Either<Failure, List<Map<String, dynamic>>> departureMapsEither =
        await mapRepository.getStationDepartures(station: station);

    return departureMapsEither.fold(
      (failure) => Left(failure),
      (departureMaps) => _convertToDepartureModels(
        station: station,
        departureMaps: departureMaps,
      ),
    );
  }

  Future<Either<Failure, List<Departure>>> _convertToDepartureModels({
    required Station station,
    required List<Map<String, dynamic>> departureMaps,
  }) async {
    final List<Departure> departureModels = [];

    List<List<ReachableStation>> stopTimes = [];

    for (final Map<String, dynamic> departureMap in departureMaps) {
      final Departure departureModel = _convertToDepartureModel(
        station: station,
        departureMap: departureMap,
      );

      bool isDuplicate = false;

      for (final List<ReachableStation> stopTime in stopTimes) {
        if (deepCollectionEquality.equals(stopTime, departureModel.stops)) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        stopTimes.add(departureModel.stops);
        departureModels.add(departureModel);
      }
    }

    return _sortDepartures(departures: departureModels);
  }

  Departure _convertToDepartureModel({
    required Station station,
    required Map<String, dynamic> departureMap,
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

    final List<ReachableStation> stops = [];

    stops.add(
      ReachableStation(
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

    final List<Map<String, dynamic>> stopMaps = departureMap['nextStops'];

    for (final Map<String, dynamic> stopMap in stopMaps) {
      final String stopId = stopMap['stopId'];
      final String stopName = stopMap['name'];
      final double stopLatitude = stopMap['lat'];
      final double stopLongitude = stopMap['lon'];

      final DateTime scheduledArrival = DateTime.parse(
        stopMap['scheduledArrival'],
      );

      final Duration duration = scheduledArrival.difference(departureTime);

      stops.add(
        ReachableStation(
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

  Future<Either<Failure, List<Departure>>> _sortDepartures({
    required List<Departure> departures,
  }) async {
    departures.sort((a, b) {
      if (a.name == b.name) {
        return a.stops.last.duration.compareTo(b.stops.last.duration);
      }

      return a.name.compareTo(b.name);
    });

    return Right(departures);
  }
}
