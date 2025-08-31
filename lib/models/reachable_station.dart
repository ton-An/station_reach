import 'package:station_reach/models/station.dart';

class ReachableStation extends Station {
  ReachableStation({
    required super.id,
    required super.name,
    required super.latitude,
    required super.longitude,
    required super.childrenIds,
    required this.duration,
  });

  final Duration duration;
}
