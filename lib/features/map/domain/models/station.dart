import 'package:equatable/equatable.dart';

class Station extends Equatable {
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
