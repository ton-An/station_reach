import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/reachable_station.dart';

class Departure {
  Departure({
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
