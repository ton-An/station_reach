import type { TransitMode } from './transit-mode';

export interface Station {
  readonly id: string;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly modes: readonly TransitMode[];
  /** ISO 3166-1 country code, absent when the search result has none. */
  readonly countryCode?: string;
  /**
   * Short place name shown beside the station name, e.g. its city or
   * district, absent when none is available.
   */
  readonly area?: string;
}

export interface Stop extends Station {
  /**
   * Minutes from the departure's scheduled time at the origin. Zero for the
   * origin stop itself.
   */
  readonly durationMinutes: number;
}
