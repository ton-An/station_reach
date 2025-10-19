import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';
import 'package:station_reach/features/map/domain/models/station.dart';

class Trip {
  factory Trip.fromJson(Map json, Station originStation) {
    final DateTime departureTime = DateTime.parse(
      json['place']['scheduledDeparture'],
    );

    final List<ReachableStation> computedStops = <ReachableStation>[];

    final List stops = json['nextStops'];

    computedStops.add(
      ReachableStation(
        id: originStation.id,
        name: originStation.name,
        latitude: originStation.latitude,
        longitude: originStation.longitude,

        duration: Duration.zero,
        childrenIds: [],
      ),
    );

    for (final Map stop in stops) {
      final DateTime stopArrivalTime = DateTime.parse(stop['scheduledArrival']);

      final String stopId = stop['stopId'];
      final String stopName = stop['name'];
      final double stopLatitude = stop['lat'];
      final double stopLongitude = stop['lon'];

      computedStops.add(
        ReachableStation(
          id: stopId,
          name: stopName,
          latitude: stopLatitude,
          longitude: stopLongitude,
          childrenIds: [],
          duration: stopArrivalTime.difference(departureTime),
        ),
      );
    }

    final TransitMode mode = TransitMode.fromString(json['mode']);
    return Trip(
      id: json['tripId'],
      name: json['routeShortName'] != null
          ? json['routeShortName']
          : json['tripShortName'] != ''
          ? json['tripShortName']
          : json['routeLongName'],
      mode: mode,
      stops: computedStops,
    );
  }
  Trip({
    required this.id,
    required this.name,
    required this.mode,
    required this.stops,
  });

  final String id;
  final String name;
  final TransitMode mode;
  final List<ReachableStation> stops;
}
