import 'package:station_reach/features/map/domain/models/station.dart';

/// {@template stop}
/// A [Station] stop of a [Departure]
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

  /// The duration [Duration] between the departure and the stop
  final Duration duration;

  @override
  List<Object?> get props => [...super.props, duration];
}
