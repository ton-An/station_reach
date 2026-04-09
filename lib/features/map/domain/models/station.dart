import 'package:equatable/equatable.dart';

/// {@template station}
/// A transit station
///
/// Parameters:
/// - id: The id [String] of the station
/// - name: The name [String] of the station
/// - latitude: The latitude [double] of the station
/// - longitude: The longitude [double] of the station
/// - countryCode: The country code [String] of the station
/// - area: The area code [String] of the station
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
  final String? area;

  @override
  List<Object?> get props => [id, name, latitude, longitude, countryCode, area];
}
