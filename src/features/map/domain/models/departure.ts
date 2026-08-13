import type { Stop } from './station';
import type { TransitMode } from './transit-mode';

export interface Departure {
  readonly id: string;
  readonly name: string;
  readonly mode: TransitMode;
  readonly stops: readonly Stop[];
}
