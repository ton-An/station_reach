/**
 * Wire shapes for the Transitous REST API. {@link toStation} and
 * {@link toDeparture} are the only functions that read these field names.
 */
export interface GeocodeArea {
  readonly name?: string;
  /**
   * How locally the area is scoped: higher is more specific, e.g. a city
   * over a country.
   */
  readonly adminLevel?: number;
}

export interface GeocodeStation {
  readonly id: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
  readonly country?: string;
  readonly modes?: readonly string[];
  readonly areas?: readonly GeocodeArea[];
}

export interface StopTimePlace {
  readonly scheduledDeparture?: string;
}

export interface NextStop {
  readonly stopId: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
  readonly modes?: readonly string[];
  readonly scheduledArrival?: string;
  readonly scheduledDeparture?: string;
}

export interface StopTime {
  readonly tripId: string;
  readonly mode: string;
  readonly place: StopTimePlace;
  readonly nextStops?: readonly NextStop[];
  readonly displayName?: string;
  readonly routeShortName?: string;
  readonly tripShortName?: string;
  readonly routeLongName?: string;
}

export interface StopTimesResponse {
  readonly stopTimes?: readonly StopTime[];
  readonly nextPageCursor?: string;
}
