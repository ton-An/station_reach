import { FailureCategory, type Failure } from './failure';

/** A {@link Failure} originating from the network layer. */
export interface NetworkFailure extends Failure {
  readonly categoryCode: typeof FailureCategory.Networking;
}

const networkFailure = (
  name: string,
  message: string,
  code: string
): NetworkFailure => ({
  name,
  message,
  categoryCode: FailureCategory.Networking,
  code,
});

export const connectionTimeoutFailure = networkFailure(
  'Connection Timeout',
  'The connection to the server timed out.',
  'connection_timeout'
);

export const sendTimeoutFailure = networkFailure(
  'Send Timeout',
  'Sending the request to the server timed out.',
  'send_timeout'
);

export const receiveTimeoutFailure = networkFailure(
  'Receive Timeout',
  'Receiving the response from the server timed out.',
  'receive_timeout'
);

export const badCertificateFailure = networkFailure(
  'Bad Certificate',
  'The server presented an invalid certificate.',
  'bad_certificate'
);

export const badResponseFailure = networkFailure(
  'Invalid Response',
  'The server returned an invalid response.',
  'bad_response'
);

export const statusCodeNotOkFailure = networkFailure(
  'Request Failed',
  'The server rejected the request.',
  'status_code_not_ok'
);

export const requestCancelledFailure = networkFailure(
  'Request Cancelled',
  'The request was cancelled.',
  'request_cancelled'
);

export const connectionFailure = networkFailure(
  'No Connection',
  'Could not reach the server. Check your internet connection.',
  'connection_failure'
);

export const unknownRequestFailure = networkFailure(
  'Unknown Error',
  'Something went wrong while talking to the server.',
  'unknown_request'
);
