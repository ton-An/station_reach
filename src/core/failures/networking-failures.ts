import { FailureCategory, type FailureBase } from './failure';

/** The server took too long to answer. */
export const receiveTimeoutFailure = {
  code: 'receive_timeout',
  categoryCode: FailureCategory.Networking,
  nameKey: 'receiveTimeoutFailureName',
  messageKey: 'receiveTimeoutFailureMessage',
} as const satisfies FailureBase;

/** The caller abandoned the request — normally a superseded search. */
export const requestCancelledFailure = {
  code: 'request_cancelled',
  categoryCode: FailureCategory.Networking,
  nameKey: 'requestCancelledFailureName',
  messageKey: 'requestCancelledFailureMessage',
} as const satisfies FailureBase;

/** The server could not be reached at all: offline, DNS, or TLS. */
export const connectionFailure = {
  code: 'connection_failure',
  categoryCode: FailureCategory.Networking,
  nameKey: 'connectionFailureName',
  messageKey: 'connectionFailureMessage',
} as const satisfies FailureBase;

/** The server answered, with a status outside 2xx. */
export const statusCodeNotOkFailure = {
  code: 'status_code_not_ok',
  categoryCode: FailureCategory.Networking,
  nameKey: 'statusCodeNotOkFailureName',
  messageKey: 'statusCodeNotOkFailureMessage',
} as const satisfies FailureBase;

/** The server answered 2xx with something that isn't the JSON we expect. */
export const badResponseFailure = {
  code: 'bad_response',
  categoryCode: FailureCategory.Networking,
  nameKey: 'badResponseFailureName',
  messageKey: 'badResponseFailureMessage',
} as const satisfies FailureBase;

/** Everything else. */
export const unknownRequestFailure = {
  code: 'unknown_request',
  categoryCode: FailureCategory.Networking,
  nameKey: 'unknownRequestFailureName',
  messageKey: 'unknownRequestFailureMessage',
} as const satisfies FailureBase;

/** Any failure originating from the network layer. */
export type NetworkingFailure =
  | typeof receiveTimeoutFailure
  | typeof requestCancelledFailure
  | typeof connectionFailure
  | typeof statusCodeNotOkFailure
  | typeof badResponseFailure
  | typeof unknownRequestFailure;
