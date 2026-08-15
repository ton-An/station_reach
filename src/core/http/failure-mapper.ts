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
 * Maps an exception caught around {@link getJson} to a networking failure.
 * The one place an exception becomes a {@link NetworkingFailure}.
 *
 * @param error - The exception caught around a request.
 * @returns {@link receiveTimeoutFailure}, {@link requestCancelledFailure},
 * {@link connectionFailure}, {@link statusCodeNotOkFailure} or
 * {@link badResponseFailure} for the matching {@link HttpError} kind, and
 * {@link unknownRequestFailure} for anything else, including a non-`HttpError`.
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
