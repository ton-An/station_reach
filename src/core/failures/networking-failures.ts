import { Failure, FailureCategory } from './failure';

/** The networking category of {@link Failure}. */
export abstract class NetworkingFailure extends Failure {
  readonly categoryCode = FailureCategory.Networking;
}

export class ReceiveTimeoutFailure extends NetworkingFailure {
  readonly nameKey = 'receiveTimeoutFailureName' as const;
  readonly messageKey = 'receiveTimeoutFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('receive_timeout', options);
  }
}

export class RequestCancelledFailure extends NetworkingFailure {
  readonly nameKey = 'requestCancelledFailureName' as const;
  readonly messageKey = 'requestCancelledFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('request_cancelled', options);
  }
}

export class ConnectionFailure extends NetworkingFailure {
  readonly nameKey = 'connectionFailureName' as const;
  readonly messageKey = 'connectionFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('connection_failure', options);
  }
}

export class StatusCodeNotOkFailure extends NetworkingFailure {
  readonly nameKey = 'statusCodeNotOkFailureName' as const;
  readonly messageKey = 'statusCodeNotOkFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('status_code_not_ok', options);
  }
}

export class BadResponseFailure extends NetworkingFailure {
  readonly nameKey = 'badResponseFailureName' as const;
  readonly messageKey = 'badResponseFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('bad_response', options);
  }
}

export class UnknownRequestFailure extends NetworkingFailure {
  readonly nameKey = 'unknownRequestFailureName' as const;
  readonly messageKey = 'unknownRequestFailureMessage' as const;

  constructor(options?: { readonly cause?: unknown }) {
    super('unknown_request', options);
  }
}
