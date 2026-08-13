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
 * @param error - Anything caught around an HTTP call.
 * @returns {@link receiveTimeoutFailure}, {@link requestCancelledFailure},
 * {@link connectionFailure}, {@link statusCodeNotOkFailure} or
 * {@link badResponseFailure}; {@link unknownRequestFailure} for anything that
 * is not an {@link HttpError}.
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
