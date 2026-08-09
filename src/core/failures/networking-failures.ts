import type { TranslationKey } from '@/core/i18n/en';
import { FailureCategory, type FailureBase } from './failure';

/**
 * Declares a networking failure.
 *
 * Generic in `code` so each constant keeps its literal type and stays usable as
 * a discriminant.
 */
function networkingFailure<Code extends string>(
  code: Code,
  nameKey: TranslationKey,
  messageKey: TranslationKey
) {
  return {
    code,
    categoryCode: FailureCategory.Networking,
    nameKey,
    messageKey,
  } as const satisfies FailureBase;
}

/** The server took too long to answer. */
export const receiveTimeoutFailure = networkingFailure(
  'receive_timeout',
  'receiveTimeoutFailureName',
  'receiveTimeoutFailureMessage'
);

/** The caller abandoned the request — normally a superseded search. */
export const requestCancelledFailure = networkingFailure(
  'request_cancelled',
  'requestCancelledFailureName',
  'requestCancelledFailureMessage'
);

/** The server could not be reached at all: offline, DNS, or TLS. */
export const connectionFailure = networkingFailure(
  'connection_failure',
  'connectionFailureName',
  'connectionFailureMessage'
);

/** The server answered, with a status outside 2xx. */
export const statusCodeNotOkFailure = networkingFailure(
  'status_code_not_ok',
  'statusCodeNotOkFailureName',
  'statusCodeNotOkFailureMessage'
);

/** The server answered 2xx with something that isn't the JSON we expect. */
export const badResponseFailure = networkingFailure(
  'bad_response',
  'badResponseFailureName',
  'badResponseFailureMessage'
);

/** Everything else. */
export const unknownRequestFailure = networkingFailure(
  'unknown_request',
  'unknownRequestFailureName',
  'unknownRequestFailureMessage'
);

/**
 * Any failure originating from the network layer.
 *
 * The equivalent of Dart's `NetworkFailure` parent class: accept this where a
 * function handles transport problems generally, and a `Failure` narrows to it
 * on a `categoryCode === FailureCategory.Networking` check.
 */
export type NetworkingFailure =
  | typeof receiveTimeoutFailure
  | typeof requestCancelledFailure
  | typeof connectionFailure
  | typeof statusCodeNotOkFailure
  | typeof badResponseFailure
  | typeof unknownRequestFailure;
