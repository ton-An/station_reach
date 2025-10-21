/*
  To-Do:
    - [ ] Remove transit modes that don't apply to the app
*/

enum TransitMode {
  walk,
  bike,
  rental,
  car,
  carParking,
  carDropoff,
  odm,
  flex,
  transit,
  tram,
  subway,
  ferry,
  airplane,
  suburban,
  bus,
  coach,
  rail,
  highspeedRail,
  longDistance,
  nightRail,
  regionalFastRail,
  regionalRail,
  cableCar,
  funicular,
  aerialLift,
  arealLift,
  metro,
  other;

  static TransitMode fromString(String value) {
    switch (value) {
      case 'WALK':
        return TransitMode.walk;
      case 'BIKE':
        return TransitMode.bike;
      case 'RENTAL':
        return TransitMode.rental;
      case 'CAR':
        return TransitMode.car;
      case 'CAR_PARKING':
        return TransitMode.carParking;
      case 'CAR_DROPOFF':
        return TransitMode.carDropoff;
      case 'ODM':
        return TransitMode.odm;
      case 'FLEX':
        return TransitMode.flex;
      case 'TRANSIT':
        return TransitMode.transit;
      case 'TRAM':
        return TransitMode.tram;
      case 'SUBWAY':
        return TransitMode.subway;
      case 'FERRY':
        return TransitMode.ferry;
      case 'AIRPLANE':
        return TransitMode.airplane;
      case 'SUBURBAN':
        return TransitMode.suburban;
      case 'BUS':
        return TransitMode.bus;
      case 'COACH':
        return TransitMode.coach;
      case 'RAIL':
        return TransitMode.rail;
      case 'HIGHSPEED_RAIL':
        return TransitMode.highspeedRail;
      case 'LONG_DISTANCE':
        return TransitMode.longDistance;
      case 'NIGHT_RAIL':
        return TransitMode.nightRail;
      case 'REGIONAL_FAST_RAIL':
        return TransitMode.regionalFastRail;
      case 'REGIONAL_RAIL':
        return TransitMode.regionalRail;
      case 'CABLE_CAR':
        return TransitMode.cableCar;
      case 'FUNICULAR':
        return TransitMode.funicular;
      case 'AERIAL_LIFT':
        return TransitMode.aerialLift;
      case 'AREAL_LIFT':
        return TransitMode.arealLift;
      case 'METRO':
        return TransitMode.metro;
      default:
        return TransitMode.other;
    }
  }
}
