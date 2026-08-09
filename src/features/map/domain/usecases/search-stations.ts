import type { ResultAsync } from 'neverthrow';

import type { Failure } from '@/core/failures';
import type { Station } from '../models/station';
import type { MapRepository } from '../repositories/map-repository';

export type SearchStations = (
  query: string,
  signal?: AbortSignal
) => ResultAsync<Station[], Failure>;

/**
 * Searches for stations by name.
 *
 * Parameters:
 * - query: the free-text search string
 * - signal: optional abort signal, so a superseded search can be cancelled
 *
 * Returns:
 * - the matching stations
 *
 * Failures:
 * - any networking failure
 */
export function createSearchStations(
  mapRepository: MapRepository
): SearchStations {
  return (query, signal) => mapRepository.searchStations(query, signal);
}
