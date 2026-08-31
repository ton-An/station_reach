import Constants from 'expo-constants';
import { Platform } from 'react-native';

import {
  BadResponseFailure,
  ConnectionFailure,
  Failure,
  type NetworkingFailure,
  ReceiveTimeoutFailure,
  RequestCancelledFailure,
  StatusCodeNotOkFailure,
  UnknownRequestFailure,
} from '@/core/failures';

const DEFAULT_TIMEOUT_MS = 20_000;
const CONTACT_EMAIL = 'anton@antons-webfabrik.eu';

/**
 * Browsers block scripts from setting `User-Agent`, so only native builds
 * send one.
 */
function requestHeaders(): Record<string, string> {
  if (Platform.OS === 'web') return { Accept: 'application/json' };

  const version = Constants.expoConfig?.version ?? '0.0.0';

  return {
    Accept: 'application/json',
    'User-Agent': `station_reach/${version} (mailto:${CONTACT_EMAIL})`,
  };
}

/**
 * Fetches `url` and parses the response as JSON.
 *
 * The request aborts once the request timeout elapses, or as soon as
 * `signal` aborts, whichever comes first — a {@link RequestCancelledFailure}
 * when `signal` aborted the request, a {@link ReceiveTimeoutFailure} when
 * the internal timeout did.
 *
 * @param url - The endpoint to fetch.
 * @param signal - Aborts the request; distinct from the request timeout.
 * @returns The parsed JSON body.
 * @throws {@link ReceiveTimeoutFailure}, {@link RequestCancelledFailure},
 * {@link ConnectionFailure}, {@link StatusCodeNotOkFailure},
 * {@link BadResponseFailure} or {@link UnknownRequestFailure}.
 */
export async function getJson<T = unknown>(
  url: string,
  signal?: AbortSignal
): Promise<T> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(
    () => timeoutController.abort(new Error('timeout')),
    DEFAULT_TIMEOUT_MS
  );

  const onCallerAbort = () => timeoutController.abort(signal?.reason);
  signal?.addEventListener('abort', onCallerAbort);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: requestHeaders(),
      signal: timeoutController.signal,
    });

    if (!response.ok) {
      throw new StatusCodeNotOkFailure();
    }

    try {
      return (await response.json()) as T;
    } catch (cause) {
      throw new BadResponseFailure({ cause });
    }
  } catch (error) {
    throw error instanceof Failure ? error : toNetworkingFailure(error, signal);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

function toNetworkingFailure(
  error: unknown,
  callerSignal?: AbortSignal
): NetworkingFailure {
  if (isAbort(error)) {
    return callerSignal?.aborted
      ? new RequestCancelledFailure({ cause: error })
      : new ReceiveTimeoutFailure({ cause: error });
  }

  if (error instanceof TypeError) {
    return new ConnectionFailure({ cause: error });
  }

  return new UnknownRequestFailure({ cause: error });
}

function isAbort(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.message === 'timeout')
  );
}
