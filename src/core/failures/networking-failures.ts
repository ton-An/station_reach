import { Failure, FailureCategory } from './failure';

export class ReceiveTimeoutFailure extends Failure {
  readonly categoryCode = FailureCategory.Networking;
  readonly nameKey = 'receiveTimeoutFailureName' as const;
  readonly messageKey = 'receiveTimeoutFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('receive_timeout', options);
  }
}

export class RequestCancelledFailure extends Failure {
  readonly categoryCode = FailureCategory.Networking;
  readonly nameKey = 'requestCancelledFailureName' as const;
  readonly messageKey = 'requestCancelledFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('request_cancelled', options);
  }
}

export class ConnectionFailure extends Failure {
  readonly categoryCode = FailureCategory.Networking;
  readonly nameKey = 'connectionFailureName' as const;
  readonly messageKey = 'connectionFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('connection_failure', options);
  }
}

export class StatusCodeNotOkFailure extends Failure {
  readonly categoryCode = FailureCategory.Networking;
  readonly nameKey = 'statusCodeNotOkFailureName' as const;
  readonly messageKey = 'statusCodeNotOkFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('status_code_not_ok', options);
  }
}

export class BadResponseFailure extends Failure {
  readonly categoryCode = FailureCategory.Networking;
  readonly nameKey = 'badResponseFailureName' as const;
  readonly messageKey = 'badResponseFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('bad_response', options);
  }
}

export class UnknownRequestFailure extends Failure {
  readonly categoryCode = FailureCategory.Networking;
  readonly nameKey = 'unknownRequestFailureName' as const;
  readonly messageKey = 'unknownRequestFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('unknown_request', options);
  }
}

/** The networking category of {@link Failure}. */
export type NetworkingFailure =
  | ReceiveTimeoutFailure
  | RequestCancelledFailure
  | ConnectionFailure
  | StatusCodeNotOkFailure
  | BadResponseFailure
  | UnknownRequestFailure;
