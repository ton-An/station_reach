import 'package:station_reach/features/map/domain/models/station.dart';

class Stop extends Station {
  Stop({
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
