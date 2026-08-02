import type { Failure } from '@/core/failures/failure';
import {
  badResponseFailure,
  connectionFailure,
  receiveTimeoutFailure,
  requestCancelledFailure,
  statusCodeNotOkFailure,
  unknownRequestFailure,
} from '@/core/failures/networking-failures';
import { HttpError } from './http-client';

/**
 * Maps a transport-level error onto a {@link Failure}.
 *
 * This is the single crossing point between "things that throw" and "things
 * that are returned" — repositories call it and nothing below them does.
 *
 * Parameters:
 * - error: anything caught around an HTTP call
 *
 * Returns:
 * - the matching networking {@link Failure}
 */
export function mapHttpError(error: unknown): Failure {
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
