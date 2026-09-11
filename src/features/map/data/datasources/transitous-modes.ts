import { TransitMode } from '../../domain/models/transit-mode';

const TRANSITOUS_TO_MODE: Readonly<Record<string, TransitMode>> = {
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

const MODE_TO_TRANSITOUS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(TRANSITOUS_TO_MODE).map(([transitous, mode]) => [
    mode,
    transitous,
  ])
);

/**
 * Maps a Transitous mode string to a {@link TransitMode}, or
 * {@link TransitMode.Other} when the value is not recognised.
 */
export function transitModeFromTransitous(value: string): TransitMode {
  return TRANSITOUS_TO_MODE[value] ?? TransitMode.Other;
}

/**
 * Maps a {@link TransitMode} to its Transitous mode string, or `'OTHER'`
 * when it has none.
 */
export function transitModeToTransitous(mode: TransitMode): string {
  return MODE_TO_TRANSITOUS[mode] ?? 'OTHER';
}
