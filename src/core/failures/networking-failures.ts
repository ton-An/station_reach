import { FailureCategory, type FailureBase } from './failure';

export const receiveTimeoutFailure = {
  code: 'receive_timeout',
  categoryCode: FailureCategory.Networking,
  nameKey: 'receiveTimeoutFailureName',
  messageKey: 'receiveTimeoutFailureMessage',
} as const satisfies FailureBase;

export const requestCancelledFailure = {
  code: 'request_cancelled',
  categoryCode: FailureCategory.Networking,
  nameKey: 'requestCancelledFailureName',
  messageKey: 'requestCancelledFailureMessage',
} as const satisfies FailureBase;

export const connectionFailure = {
  code: 'connection_failure',
  categoryCode: FailureCategory.Networking,
  nameKey: 'connectionFailureName',
  messageKey: 'connectionFailureMessage',
} as const satisfies FailureBase;

export const statusCodeNotOkFailure = {
  code: 'status_code_not_ok',
  categoryCode: FailureCategory.Networking,
  nameKey: 'statusCodeNotOkFailureName',
  messageKey: 'statusCodeNotOkFailureMessage',
} as const satisfies FailureBase;

export const badResponseFailure = {
  code: 'bad_response',
  categoryCode: FailureCategory.Networking,
  nameKey: 'badResponseFailureName',
  messageKey: 'badResponseFailureMessage',
} as const satisfies FailureBase;

export const unknownRequestFailure = {
  code: 'unknown_request',
  categoryCode: FailureCategory.Networking,
  nameKey: 'unknownRequestFailureName',
  messageKey: 'unknownRequestFailureMessage',
} as const satisfies FailureBase;

export type NetworkingFailure =
  | typeof receiveTimeoutFailure
  | typeof requestCancelledFailure
  | typeof connectionFailure
  | typeof statusCodeNotOkFailure
  | typeof badResponseFailure
  | typeof unknownRequestFailure;
