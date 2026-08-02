/*
  To-Do:
    - [ ] Trim the modes Transitous never returns for a stop (car, airplane,
          flex, odm, rental …). They came over from the MOTIS routing API and
          this app only ever renders departures.
*/

/**
 * A mode of transit, as reported by the Transitous API.
 *
 * The wire format is SCREAMING_SNAKE_CASE; {@link transitModeFromWire} and
 * {@link transitModeToWire} are the only places that knowledge lives.
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

// Deliberate value/type merge: `TransitMode.Rail` and `mode: TransitMode` both
// read naturally, the way the Dart enum did.
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TransitMode = (typeof TransitMode)[keyof typeof TransitMode];

const WIRE_TO_MODE: Readonly<Record<string, TransitMode>> = {
  WALK: TransitMode.Walk,
  BIKE: TransitMode.Bike,
  RENTAL: TransitMode.Rental,
  CAR: TransitMode.Car,
  CAR_PARKING: TransitMode.CarParking,
  CAR_DROPOFF: TransitMode.CarDropoff,
  ODM: TransitMode.Odm,
  FLEX: TransitMode.Flex,
  TRANSIT: TransitMode.Transit,
  TRAM: TransitMode.Tram,
  SUBWAY: TransitMode.Subway,
  FERRY: TransitMode.Ferry,
  AIRPLANE: TransitMode.Airplane,
  SUBURBAN: TransitMode.Suburban,
  BUS: TransitMode.Bus,
  COACH: TransitMode.Coach,
  RAIL: TransitMode.Rail,
  HIGHSPEED_RAIL: TransitMode.HighspeedRail,
  LONG_DISTANCE: TransitMode.LongDistance,
  NIGHT_RAIL: TransitMode.NightRail,
  REGIONAL_FAST_RAIL: TransitMode.RegionalFastRail,
  REGIONAL_RAIL: TransitMode.RegionalRail,
  CABLE_CAR: TransitMode.CableCar,
  FUNICULAR: TransitMode.Funicular,
  AERIAL_LIFT: TransitMode.AerialLift,
  AREAL_LIFT: TransitMode.ArealLift,
  METRO: TransitMode.Metro,
};

const MODE_TO_WIRE = Object.fromEntries(
  Object.entries(WIRE_TO_MODE).map(([wire, mode]) => [mode, wire])
) as Readonly<Record<TransitMode, string>>;

/**
 * Parses a Transitous mode string.
 *
 * Unknown modes degrade to {@link TransitMode.Other} rather than throwing — the
 * upstream vocabulary grows and a new mode should not break a whole response.
 */
export function transitModeFromWire(value: string): TransitMode {
  return WIRE_TO_MODE[value] ?? TransitMode.Other;
}

/** Serialises a mode for the `mode=` query parameter. */
export function transitModeToWire(mode: TransitMode): string {
  return MODE_TO_WIRE[mode] ?? 'OTHER';
}
