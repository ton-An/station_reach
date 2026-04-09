import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';

/// {@template departure}
/// A departure from a [Station]
///
/// Parameters:
/// - id: The id [String] of the departure
/// - name: The name [String] of the departure
/// - mode: The [TransitMode] of the departure
/// - stops: The [List] of [Stop]s of the departure
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
  final List<Stop> stops;
}
