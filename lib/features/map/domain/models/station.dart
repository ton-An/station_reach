import 'package:equatable/equatable.dart';

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
    this.countryCode,
    this.area,
  });

  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final String? countryCode;

  /// The name of the area of the station
  final String? area;

  @override
  List<Object?> get props => [id, name, latitude, longitude, countryCode, area];
}
