import { TransitMode } from '../../domain/models/transit-mode';

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

const MODE_TO_WIRE: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(WIRE_TO_MODE).map(([wire, mode]) => [mode, wire])
);

export function transitModeFromWire(value: string): TransitMode {
  return WIRE_TO_MODE[value] ?? TransitMode.Other;
}

export function transitModeToWire(mode: TransitMode): string {
  return MODE_TO_WIRE[mode] ?? 'OTHER';
}
