enum TransitMode {
  airplane,
  bus,
  cableCar,
  carpool,
  coach,
  ferry,
  funicular,
  gondola,
  monorail,
  rail,
  subway,
  taxi,
  tram,
  trolleybus,
  unknown;

  static TransitMode fromString(String value) {
    switch (value) {
      case 'AIRPLANE':
        return TransitMode.airplane;
      case 'BUS':
        return TransitMode.bus;
      case 'CABLE_CAR':
        return TransitMode.cableCar;
      case 'CARPOOL':
        return TransitMode.carpool;
      case 'COACH':
        return TransitMode.coach;
      case 'FERRY':
        return TransitMode.ferry;
      case 'FUNICULAR':
        return TransitMode.funicular;
      case 'GONDOLA':
        return TransitMode.gondola;
      case 'MONORAIL':
        return TransitMode.monorail;
      case 'RAIL':
        return TransitMode.rail;
      case 'SUBWAY':
        return TransitMode.subway;
      case 'TAXI':
        return TransitMode.taxi;
      case 'TRAM':
        return TransitMode.tram;
      case 'TROLLEYBUS':
        return TransitMode.trolleybus;
      default:
        return TransitMode.unknown;
    }
  }
}
