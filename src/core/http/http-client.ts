import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Why an HTTP call failed. Mirrors the shape the failure mapper expects. */
export type HttpErrorKind =
  | 'timeout'
  | 'cancelled'
  | 'connection'
  | 'badStatus'
  | 'badResponse'
  | 'unknown';

/**
 * A transport-level error.
 *
 * Thrown by {@link getJson} and caught in the repository layer, which converts
 * it into a `Failure`. `body` carries the decoded error payload when the server
 * sent one — the departures data source inspects it to detect the known MOTIS
 * "Departure is last stop in trip" bug.
 */
export class HttpError extends Error {
  constructor(
    readonly kind: HttpErrorKind,
    readonly status?: number,
    readonly body?: unknown,
    options?: { cause?: unknown }
  ) {
    super(`HTTP ${kind}${status === undefined ? '' : ` (${status})`}`, options);
    this.name = 'HttpError';
  }
}

const DEFAULT_TIMEOUT_MS = 20_000;
const CONTACT_EMAIL = 'anton@antons-webfabrik.eu';

/**
 * The User-Agent Transitous asks API consumers to identify themselves with.
 *
 * Browsers forbid setting this header, so on web it is simply omitted — that is
 * expected, not a bug to work around.
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
 * Performs a GET request and decodes the JSON body.
 *
 * Parameters:
 * - url: the fully-qualified request URL
 * - signal: optional caller-owned abort signal, for cancelling in-flight work
 *
 * Returns:
 * - the decoded JSON body, typed as the caller asserts
 *
 * Throws:
 * - {@link HttpError}
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

  // Abort when either the caller cancels or the timeout fires.
  const onCallerAbort = () => timeoutController.abort(signal?.reason);
  signal?.addEventListener('abort', onCallerAbort);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: requestHeaders(),
      signal: timeoutController.signal,
    });

    if (!response.ok) {
      throw new HttpError(
        'badStatus',
        response.status,
        await safeJson(response)
      );
    }

    try {
      return (await response.json()) as T;
    } catch (cause) {
      throw new HttpError('badResponse', response.status, undefined, { cause });
    }
  } catch (error) {
    throw toHttpError(error, signal);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

/** Decodes an error response body, tolerating non-JSON payloads. */
async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/** Normalises anything `fetch` can reject with into an {@link HttpError}. */
function toHttpError(error: unknown, callerSignal?: AbortSignal): HttpError {
  if (error instanceof HttpError) return error;

  if (isAbort(error)) {
    // The caller cancelling and our own timeout both surface as aborts.
    return callerSignal?.aborted
      ? new HttpError('cancelled', undefined, undefined, { cause: error })
      : new HttpError('timeout', undefined, undefined, { cause: error });
  }

  // `fetch` rejects with a TypeError for DNS, offline and TLS problems alike.
  if (error instanceof TypeError) {
    return new HttpError('connection', undefined, undefined, { cause: error });
  }

  return new HttpError('unknown', undefined, undefined, { cause: error });
}

function isAbort(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.message === 'timeout')
  );
}
