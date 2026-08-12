import type { Failure } from '@/core/failures';
import type { Departure } from './departure';

/**
 * Everywhere a station can take you.
 *
 * The departures are assembled from two independent upstream calls — long
 * distance and regional — so the result has three outcomes, not two: both
 * worked, both failed, or one worked and the map is missing a whole class of
 * service. The third is why this is a record rather than a bare list: a map
 * drawn without its regional departures looks complete and is not, and the only
 * honest way to show it is to show it *and* say so.
 */
export interface StationReachability {
  readonly departures: readonly Departure[];
  /**
   * Set when one mode bucket failed and the map was drawn without it.
   *
   * Not an error — the departures beside it are real and worth showing. The
   * presentation layer surfaces this as a notification over a working map.
   */
  readonly partialFailure?: Failure;
}
