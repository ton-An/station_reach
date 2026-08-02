import { errAsync, okAsync } from 'neverthrow';

import { connectionFailure } from '@/core/failures/networking-failures';
import { noDeparturesFoundFailure } from '@/core/failures/transit-failures';
import type { Departure } from '../models/departure';
import type { Station, Stop } from '../models/station';
import { TransitMode } from '../models/transit-mode';
import type { MapRepository } from '../repositories/map-repository';
import { createGetStationDepartures } from './get-station-departures';

const ORIGIN: Station = {
  id: 'origin',
  name: 'Origin',
  latitude: 0,
  longitude: 0,
  modes: [TransitMode.Rail],
};

function stop(id: string, durationMinutes: number): Stop {
  return {
    id,
    name: id,
    latitude: 1,
    longitude: 1,
    modes: [TransitMode.Rail],
    durationMinutes,
  };
}

function departure(
  id: string,
  name: string,
  stops: readonly Stop[]
): Departure {
  return { id, name, mode: TransitMode.Rail, stops };
}

/** A repository whose two mode buckets can be scripted independently. */
function repositoryReturning(
  longDistance: ReturnType<MapRepository['getStationDeparturesByMode']>,
  regional: ReturnType<MapRepository['getStationDeparturesByMode']>
): MapRepository {
  let call = 0;

  return {
    searchStations: () => okAsync([]),
    getStationDeparturesByMode: () => (call++ === 0 ? longDistance : regional),
  };
}

describe('getStationDepartures', () => {
  it('merges both mode buckets', async () => {
    const usecase = createGetStationDepartures(
      repositoryReturning(
        okAsync([departure('1', 'ICE 1', [stop('origin', 0), stop('a', 60)])]),
        okAsync([departure('2', 'Bus 9', [stop('origin', 0), stop('b', 10)])])
      )
    );

    const result = await usecase(ORIGIN);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().map((d) => d.name)).toEqual([
      'Bus 9',
      'ICE 1',
    ]);
  });

  it('drops trips that visit exactly the same stops', async () => {
    const stops = [stop('origin', 0), stop('a', 30)];

    const usecase = createGetStationDepartures(
      repositoryReturning(
        okAsync([departure('1', 'ICE 1', stops)]),
        okAsync([departure('2', 'ICE 1 (dup)', [...stops])])
      )
    );

    const result = await usecase(ORIGIN);

    // The long-distance name wins, because dedupe runs before the sort.
    expect(result._unsafeUnwrap().map((d) => d.name)).toEqual(['ICE 1']);
  });

  it('keeps distinct trips that share a name', async () => {
    const usecase = createGetStationDepartures(
      repositoryReturning(
        okAsync([
          departure('1', 'RE 1', [stop('origin', 0), stop('far', 120)]),
          departure('2', 'RE 1', [stop('origin', 0), stop('near', 20)]),
        ]),
        errAsync(noDeparturesFoundFailure)
      )
    );

    const result = await usecase(ORIGIN);

    // Same name, so the shorter trip sorts first.
    expect(result._unsafeUnwrap().map((d) => d.id)).toEqual(['2', '1']);
  });

  it('falls back to regional when long distance has nothing', async () => {
    const usecase = createGetStationDepartures(
      repositoryReturning(
        errAsync(noDeparturesFoundFailure),
        okAsync([departure('2', 'Bus 9', [stop('origin', 0), stop('b', 10)])])
      )
    );

    const result = await usecase(ORIGIN);

    expect(result._unsafeUnwrap().map((d) => d.name)).toEqual(['Bus 9']);
  });

  it('falls back to long distance when regional has nothing', async () => {
    const usecase = createGetStationDepartures(
      repositoryReturning(
        okAsync([departure('1', 'ICE 1', [stop('origin', 0), stop('a', 60)])]),
        errAsync(noDeparturesFoundFailure)
      )
    );

    const result = await usecase(ORIGIN);

    expect(result._unsafeUnwrap().map((d) => d.name)).toEqual(['ICE 1']);
  });

  it('propagates a real failure rather than silently halving the map', async () => {
    const usecase = createGetStationDepartures(
      repositoryReturning(
        errAsync(connectionFailure),
        okAsync([departure('2', 'Bus 9', [stop('origin', 0), stop('b', 10)])])
      )
    );

    const result = await usecase(ORIGIN);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual(connectionFailure);
  });

  it('requests both buckets concurrently, not one after the other', async () => {
    const started: number[] = [];
    let settleCount = 0;

    const repository: MapRepository = {
      searchStations: () => okAsync([]),
      getStationDeparturesByMode: () => {
        started.push(settleCount);
        return okAsync([]);
      },
    };

    await createGetStationDepartures(repository)(ORIGIN);

    // Both calls are issued before either has been awaited.
    expect(started).toEqual([0, 0]);
  });
});
