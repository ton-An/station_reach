import type { TransitMode } from './transit-mode';

/** A transit station. */
export interface Station {
  readonly id: string;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly modes: readonly TransitMode[];
  readonly countryCode?: string;
  /** The name of the administrative area the station sits in. */
  readonly area?: string;
}

/**
 * A {@link Station} reached by a departure.
 *
 * `durationMinutes` is measured from the departure's origin, so the origin stop
 * is always zero.
 */
export interface Stop extends Station {
  readonly durationMinutes: number;
}
