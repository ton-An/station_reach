import 'package:station_reach/models/station.dart';

class Trip {
  Trip({required this.id, required this.name, required this.stops});

  final String id;
  final String name;
  final List<Station> stops;

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['tripId'],
      name: json['line']['name'],
      stops: (json['nextStopovers'] as List)
          .where(
            (stop) =>
                stop['stop']['id'] != null &&
                stop['stop']['name'] != null &&
                stop['stop']['location'] != null,
          )
          .map((stop) => Station.fromJson(stop['stop']))
          .toList(),
    );
  }
}
