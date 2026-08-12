/**
 * The Transitous wire shapes this app depends on.
 *
 * Deliberately partial — only the fields we read are declared, so an upstream
 * addition never breaks the build. These types exist solely inside the data
 * layer; nothing above it should import them.
 */

export interface GeocodeArea {
  readonly name?: string;
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
