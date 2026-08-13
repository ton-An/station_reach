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
 * @returns The matching stations, or a {@link NetworkingFailure}.
 */
export function createSearchStations(
  mapRepository: MapRepository
): SearchStations {
  return (query, signal) => mapRepository.searchStations(query, signal);
}
