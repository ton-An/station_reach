import 'package:equatable/equatable.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';

/// {@template station}
/// A transit station
/// {@endtemplate}
class Station extends Equatable {
  /// {@macro station}
  const Station({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.modes,
    this.countryCode,
    this.area,
  });

  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final List<TransitMode> modes;
  final String? countryCode;

  /// The name of the area of the station
  final String? area;

  @override
  List<Object?> get props => [
    id,
    name,
    latitude,
    longitude,
    modes,
    countryCode,
    area,
  ];
}
