import type { Stop } from './station';
import type { TransitMode } from './transit-mode';

/**
 * A departure or service leaving a station, with its itinerary.
 */
export interface Departure {
  readonly id: string;
  readonly name: string;
  readonly mode: TransitMode;
  readonly stops: readonly Stop[];
}
