import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * The categorization of what went wrong during an HTTP operation. Mapped to
 * {@link Failure}s by {@link mapHttpError}.
 */
export type HttpErrorKind =
  | 'timeout'
  | 'cancelled'
  | 'connection'
  | 'badStatus'
  | 'badResponse'
  | 'unknown';

/**
 * Categorizes an HTTP error so failures can be mapped without inspecting the
 * original exception.
 *
 * @param kind - The category of error.
 * @param options - Optional error options with a cause.
 */
export class HttpError extends Error {
  constructor(
    readonly kind: HttpErrorKind,
    options?: { readonly cause?: unknown }
  ) {
    super(`HTTP ${kind}`, options);
    this.name = 'HttpError';
  }
}

const DEFAULT_TIMEOUT_MS = 20_000;
const CONTACT_EMAIL = 'anton@antons-webfabrik.eu';

function requestHeaders(): Record<string, string> {
  if (Platform.OS === 'web') return { Accept: 'application/json' };

  const version = Constants.expoConfig?.version ?? '0.0.0';

  return {
    Accept: 'application/json',
    'User-Agent': `station_reach/${version} (mailto:${CONTACT_EMAIL})`,
  };
}

/**
 * Fetches JSON from a URL with a timeout and abort signal support.
 *
 * Throws {@link HttpError} on network failures, bad response status, or
 * malformed JSON. The kind field narrows which failure applies.
 *
 * @param url - The URL to fetch.
 * @param signal - Optional abort signal. Cancelling it stops the request.
 * @returns The parsed JSON response.
 * @throws {@link HttpError} for any network or parsing failure.
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
      throw new HttpError('badStatus');
    }

    try {
      return (await response.json()) as T;
    } catch (cause) {
      throw new HttpError('badResponse', { cause });
    }
  } catch (error) {
    throw toHttpError(error, signal);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

// The caller cancelling and the internal timeout both surface as an abort.
// Only the caller's signal reports itself as aborted, which is what tells the
// two apart.
function toHttpError(error: unknown, callerSignal?: AbortSignal): HttpError {
  if (error instanceof HttpError) return error;

  if (isAbort(error)) {
    return callerSignal?.aborted
      ? new HttpError('cancelled', { cause: error })
      : new HttpError('timeout', { cause: error });
  }

  if (error instanceof TypeError) {
    return new HttpError('connection', { cause: error });
  }

  return new HttpError('unknown', { cause: error });
}

// An abort error can have either name 'AbortError' or message 'timeout',
// depending on which controller raised it.
function isAbort(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.message === 'timeout')
  );
}
