import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';

class Trip {
  factory Trip.fromJson(Map json) {
    final Map<String, dynamic> trip = json['stoptimes'][0];

    final Duration arrivalTime = Duration(seconds: trip['scheduledArrival']);
    final Duration departureTime = Duration(
      seconds: trip['scheduledDeparture'],
    );

    final List stops = trip['trip']['stoptimes'];

    final List<ReachableStation> computedStops = <ReachableStation>[];

    for (final Map stop in stops) {
      final stopArrivalTime = Duration(seconds: stop['scheduledArrival']);

      if (stopArrivalTime < arrivalTime) {
        continue;
      }

      final String stopId = stop['stop']['gtfsId'];
      final String stopName = stop['stop']['name'];
      final double stopLatitude = stop['stop']['lat'];
      final double stopLongitude = stop['stop']['lon'];

      computedStops.add(
        ReachableStation(
          id: stopId,
          name: stopName,
          latitude: stopLatitude,
          longitude: stopLongitude,
          childrenIds: [],
          duration: stopArrivalTime - departureTime,
        ),
      );
    }

    final TransitMode mode = TransitMode.fromString(
      json['pattern']['route']['mode'],
    );

    return Trip(
      id: json['pattern']['id'],
      name: json['pattern']['route']['shortName'],
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
