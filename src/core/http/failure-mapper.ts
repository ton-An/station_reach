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
 * Maps an {@link HttpError} to its corresponding {@link NetworkingFailure}. If
 * the error is not an HttpError, returns {@link unknownRequestFailure}.
 *
 * @param error - The error to map.
 * @returns The matching failure: {@link receiveTimeoutFailure},
 * {@link requestCancelledFailure}, {@link connectionFailure},
 * {@link statusCodeNotOkFailure}, {@link badResponseFailure}, or
 * {@link unknownRequestFailure}.
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
