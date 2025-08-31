import 'package:station_reach/models/reachable_station.dart';

class Trip {
  Trip({required this.id, required this.name, required this.stops});

  final String id;
  final String name;
  final List<ReachableStation> stops;

  factory Trip.fromJson(Map json) {
    final Map<String, dynamic> trip = json['stoptimes'][0];

    final Duration departureTime = Duration(
      seconds: trip['scheduledDeparture'],
    );

    final List<Map> stops = trip['trip']['stoptimes'];

    final List<ReachableStation> computedStops = <ReachableStation>[];

    for (final Map stop in stops) {
      final stopArrivalTime = Duration(seconds: stop['scheduledArrival']);

      if (stopArrivalTime < departureTime) {
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

    return Trip(
      id: json['pattern']['id'],
      name: json['pattern']['route']['shortName'],
      stops: computedStops,
    );
  }
}
