import type { Stop } from './station';
import type { TransitMode } from './transit-mode';

/**
 * A single trip leaving a station.
 *
 * `stops` starts at the origin station (duration zero) and runs to the end of
 * the trip, in travel order.
 */
export interface Departure {
  readonly id: string;
  readonly name: string;
  readonly mode: TransitMode;
  readonly stops: readonly Stop[];
}
