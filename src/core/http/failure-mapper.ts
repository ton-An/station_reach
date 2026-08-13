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
