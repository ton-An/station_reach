import 'package:station_reach/features/map/domain/models/station.dart';

class ReachableStation extends Station {
  ReachableStation({
    required super.id,
    required super.name,
    required super.latitude,
    required super.longitude,
    super.countryCode,
    required super.childrenIds,
    required this.duration,
  });

  final Duration duration;

  @override
  List<Object?> get props => [
    id,
    name,
    latitude,
    longitude,
    countryCode,
    childrenIds,
    duration,
  ];
}
