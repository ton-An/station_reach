/*
  To-Do:
    - [ ] Trim the modes Transitous never returns for a stop (car, airplane,
          flex, odm, rental …). They came over from the MOTIS routing API and
          this app only ever renders departures.
*/

export const TransitMode = {
  Walk: 'walk',
  Bike: 'bike',
  Rental: 'rental',
  Car: 'car',
  CarParking: 'carParking',
  CarDropoff: 'carDropoff',
  Odm: 'odm',
  Flex: 'flex',
  Transit: 'transit',
  Tram: 'tram',
  Subway: 'subway',
  Ferry: 'ferry',
  Airplane: 'airplane',
  Suburban: 'suburban',
  Bus: 'bus',
  Coach: 'coach',
  Rail: 'rail',
  HighspeedRail: 'highspeedRail',
  LongDistance: 'longDistance',
  NightRail: 'nightRail',
  RegionalFastRail: 'regionalFastRail',
  RegionalRail: 'regionalRail',
  CableCar: 'cableCar',
  Funicular: 'funicular',
  AerialLift: 'aerialLift',
  ArealLift: 'arealLift',
  Metro: 'metro',
  Other: 'other',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TransitMode = (typeof TransitMode)[keyof typeof TransitMode];
