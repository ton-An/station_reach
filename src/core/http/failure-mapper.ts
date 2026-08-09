import {
  badResponseFailure,
  connectionFailure,
  receiveTimeoutFailure,
  requestCancelledFailure,
  statusCodeNotOkFailure,
  unknownRequestFailure,
  type NetworkingFailure,
} from '@/core/failures';
import { HttpError } from './http-client';

/**
 * Maps a transport-level error onto a {@link NetworkingFailure}.
 *
 * This is the single crossing point between "things that throw" and "things
 * that are returned" — repositories call it and nothing below them does.
 *
 * Parameters:
 * - error: anything caught around an HTTP call
 *
 * Returns:
 * - the matching networking failure
 */
export function mapHttpError(error: unknown): NetworkingFailure {
  if (!(error instanceof HttpError)) return unknownRequestFailure;

  switch (error.kind) {
    case 'timeout':
      return receiveTimeoutFailure;
    case 'cancelled':
      return requestCancelledFailure;
    case 'connection':
      return connectionFailure;
    case 'badStatus':
      return statusCodeNotOkFailure;
    case 'badResponse':
      return badResponseFailure;
    case 'unknown':
      return unknownRequestFailure;
  }
}
