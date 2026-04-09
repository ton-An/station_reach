import 'package:station_reach/features/map/domain/models/station.dart';

/// {@template stop}
/// A [Station] stop of a [Departure]
///
/// Parameters:
/// - id: The id [String] of the stop
/// - name: The name [String] of the stop
/// - latitude: The latitude [double] of the stop
/// - longitude: The longitude [double] of the stop
/// - duration: The duration [Duration] between the departure and the stop
/// - countryCode: The country code [String] of the stop
/// {@endtemplate}
class Stop extends Station {
  /// {@macro stop}
  const Stop({
    required super.id,
    required super.name,
    required super.latitude,
    required super.longitude,
    required this.duration,
    super.countryCode,
  });

  final Duration duration;

  @override
  List<Object?> get props => [...super.props, duration];
}
