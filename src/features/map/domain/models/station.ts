import type { TransitMode } from './transit-mode';

/**
 * A transit station or stop.
 */
export interface Station {
  readonly id: string;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly modes: readonly TransitMode[];
  readonly countryCode?: string;
  readonly area?: string;
}

/**
 * A stop on a departure itinerary.
 *
 * Extends {@link Station} with the travel time from the origin's scheduled
 * departure to this stop's arrival.
 */
export interface Stop extends Station {
  readonly durationMinutes: number;
}
