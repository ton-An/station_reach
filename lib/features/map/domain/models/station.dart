class Station {
  factory Station.fromJson(Map json) {
    return Station(
      id: json['primary']?['id'] ?? json['id'] ?? json['gtfsId'],
      name: json['description'] ?? json['name'] ?? json['primary']?['name'],
      latitude:
          json['lat'] ?? json['lat'] ?? json['primary']?['coordinate']['lat'],
      longitude:
          json['lon'] ?? json['lon'] ?? json['primary']?['coordinate']['lon'],
      childrenIds:
          json['secondaries']
              ?.map((secondary) => secondary['id'])
              .toList()
              .cast<String>() ??
          [],
    );
  }
  Station({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.childrenIds,
  });

  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final List<String> childrenIds;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'latitude': latitude,
      'longitude': longitude,
      'childrenIds': childrenIds,
    };
  }
}
