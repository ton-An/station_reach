import 'package:equatable/equatable.dart';

class Station extends Equatable {
  factory Station.fromJson(Map json) {
    String? area;

    adminLevelLoop:
    for (double adminLevel = 7; adminLevel >= 0; adminLevel--) {
      for (final Map stationArea in json['areas']) {
        if (stationArea['adminLevel'] == adminLevel) {
          area = stationArea['name'];
          break adminLevelLoop;
        }
      }
    }

    return Station(
      id: json['id'],
      name: json['name'],
      latitude: json['lat'],
      longitude: json['lon'],
      countryCode: json['country'],
      area: area,
      childrenIds: [],
    );
  }
  Station({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    this.countryCode,
    this.area,
    required this.childrenIds,
  });

  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final String? countryCode;
  final String? area;
  final List<String> childrenIds;

  @override
  List<Object?> get props => [
    id,
    name,
    latitude,
    longitude,
    countryCode,
    area,
    childrenIds,
  ];
}
