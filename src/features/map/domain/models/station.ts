import type { TransitMode } from './transit-mode';

export interface Station {
  readonly id: string;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly modes: readonly TransitMode[];
  readonly countryCode?: string;
  readonly area?: string;
}

export interface Stop extends Station {
  readonly durationMinutes: number;
}
