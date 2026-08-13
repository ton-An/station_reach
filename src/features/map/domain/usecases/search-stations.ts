import type { ResultAsync } from 'neverthrow';

import type { Failure } from '@/core/failures';
import type { Station } from '../models/station';
import type { MapRepository } from '../repositories/map-repository';

/**
 * Searches for stations by name.
 *
 * @param query - The free-text search string.
 * @param signal - Optional abort signal to cancel the search.
 * @returns A {@link ResultAsync} with the matching stations or a
 * {@link NetworkingFailure}.
 */
export type SearchStations = (
  query: string,
  signal?: AbortSignal
) => ResultAsync<Station[], Failure>;

/**
 * Creates a use case that searches for stations by name.
 */
export function createSearchStations(
  mapRepository: MapRepository
): SearchStations {
  return (query, signal) => mapRepository.searchStations(query, signal);
}
