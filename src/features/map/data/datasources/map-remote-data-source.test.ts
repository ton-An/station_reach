import { FailureError } from '@/core/failures/failure-error';
import { HttpError } from '@/core/http/http-client';
import type { Station } from '../../domain/models/station';
import { TransitMode } from '../../domain/models/transit-mode';
import { createMapRemoteDataSource } from './map-remote-data-source';

jest.mock('@/core/http/http-client', () => {
  const actual = jest.requireActual('@/core/http/http-client');
  return { ...actual, getJson: jest.fn() };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getJson } = require('@/core/http/http-client') as {
  getJson: jest.Mock;
};

const ORIGIN: Station = {
  id: 'de:11:900',
  name: 'Berlin Hbf',
  latitude: 52.52,
  longitude: 13.37,
  modes: [TransitMode.Rail],
};

/** The exact upstream payload the workaround exists for. */
const lastStopError = () =>
  new HttpError('badStatus', 400, { error: 'Departure is last stop in trip' });

function stopTimesPage(tripId: string) {
  return {
    nextPageCursor: 'cursor',
    stopTimes: [
      {
        tripId,
        mode: 'RAIL',
        displayName: 'ICE 123',
        place: { scheduledDeparture: '2026-08-02T10:00:00Z' },
        nextStops: [
          {
            stopId: 'de:11:901',
            name: 'Spandau',
            lat: 52.53,
            lon: 13.2,
            modes: ['RAIL'],
            scheduledArrival: '2026-08-02T10:20:00Z',
          },
        ],
      },
    ],
  };
}

beforeEach(() => {
  getJson.mockReset();
});

describe('getStationDeparturesByMode', () => {
  it('makes exactly one request when upstream behaves', async () => {
    getJson.mockResolvedValueOnce(stopTimesPage('trip-1'));

    const departures =
      await createMapRemoteDataSource().getStationDeparturesByMode(
        ORIGIN,
        [TransitMode.Rail],
        100
      );

    expect(getJson).toHaveBeenCalledTimes(1);
    expect(departures).toHaveLength(1);
    expect(departures[0]?.name).toBe('ICE 123');
  });

  it('prepends the origin at duration zero and times the rest from it', async () => {
    getJson.mockResolvedValueOnce(stopTimesPage('trip-1'));

    const [departure] =
      await createMapRemoteDataSource().getStationDeparturesByMode(
        ORIGIN,
        [TransitMode.Rail],
        100
      );

    expect(departure?.stops[0]).toMatchObject({
      id: ORIGIN.id,
      durationMinutes: 0,
    });
    expect(departure?.stops[1]).toMatchObject({
      id: 'de:11:901',
      durationMinutes: 20,
    });
  });

  it('retries the known MOTIS last-stop bug with a later time window', async () => {
    getJson
      .mockRejectedValueOnce(lastStopError())
      .mockResolvedValueOnce(stopTimesPage('trip-1'));

    const departures =
      await createMapRemoteDataSource().getStationDeparturesByMode(
        ORIGIN,
        [TransitMode.Rail],
        100
      );

    expect(getJson).toHaveBeenCalledTimes(2);
    expect(departures).toHaveLength(1);

    // The retry drops the cursor and asks for a window an hour later.
    const retryUrl = getJson.mock.calls[1]?.[0] as string;
    expect(retryUrl).not.toContain('pageCursor');
    expect(retryUrl).toContain('&time=');
  });

  it('gives up on the last-stop bug after ten retries', async () => {
    getJson.mockRejectedValue(lastStopError());

    const departures =
      await createMapRemoteDataSource().getStationDeparturesByMode(
        ORIGIN,
        [TransitMode.Rail],
        100
      );

    // One initial attempt plus ten granted retries.
    expect(getJson).toHaveBeenCalledTimes(11);
    expect(departures).toEqual([]);
  });

  it('treats a missing page cursor as "nothing to show"', async () => {
    getJson.mockResolvedValueOnce({ stopTimes: [], nextPageCursor: '' });

    await expect(
      createMapRemoteDataSource().getStationDeparturesByMode(
        ORIGIN,
        [TransitMode.Rail],
        100
      )
    ).rejects.toBeInstanceOf(FailureError);
  });

  it('rethrows errors that are not the last-stop bug', async () => {
    getJson.mockRejectedValueOnce(new HttpError('connection'));

    await expect(
      createMapRemoteDataSource().getStationDeparturesByMode(
        ORIGIN,
        [TransitMode.Rail],
        100
      )
    ).rejects.toBeInstanceOf(HttpError);
  });
});

describe('searchStations', () => {
  it('names a station after its most specific administrative area', async () => {
    getJson.mockResolvedValueOnce([
      {
        id: 'de:11:900',
        name: 'Hauptbahnhof',
        lat: 52.52,
        lon: 13.37,
        country: 'DE',
        modes: ['RAIL', 'SUBWAY'],
        areas: [
          { name: 'Germany', adminLevel: 2 },
          { name: 'Berlin', adminLevel: 4 },
          { name: 'Mitte', adminLevel: 7 },
        ],
      },
    ]);

    const [station] = await createMapRemoteDataSource().searchStations('haupt');

    expect(station).toMatchObject({
      area: 'Mitte',
      countryCode: 'DE',
      modes: [TransitMode.Rail, TransitMode.Subway],
    });
  });

  it('leaves the area unset when no level is low enough', async () => {
    getJson.mockResolvedValueOnce([
      {
        id: 'x',
        name: 'Somewhere',
        lat: 0,
        lon: 0,
        modes: [],
        areas: [{ name: 'Continent', adminLevel: 9 }],
      },
    ]);

    const [station] = await createMapRemoteDataSource().searchStations('some');

    expect(station?.area).toBeUndefined();
  });
});
