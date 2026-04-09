import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';

/// {@template departure}
/// A departure from a [Station]
/// {@endtemplate}
class Departure {
  /// {@macro departure}
  Departure({
    required this.id,
    required this.name,
    required this.mode,
    required this.stops,
  });

  final String id;
  final String name;
  final TransitMode mode;

  /// The other stops of the departure
  final List<Stop> stops;
}
