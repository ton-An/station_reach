import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type HttpErrorKind =
  | 'timeout'
  | 'cancelled'
  | 'connection'
  | 'badStatus'
  /** The response body was not valid JSON. */
  | 'badResponse'
  /** The catch-all for anything {@link getJson} cannot otherwise classify. */
  | 'unknown';

/** Thrown by {@link getJson}; `kind` says why the request failed. */
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
 * `signal` aborts, whichever comes first. `HttpError.kind` tells the two
 * apart: `'cancelled'` when `signal` aborted the request, `'timeout'` when
 * the internal timeout did.
 *
 * @param url - The endpoint to fetch.
 * @param signal - Aborts the request; distinct from the request timeout.
 * @returns The parsed JSON body.
 * @throws {@link HttpError}
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

function isAbort(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.message === 'timeout')
  );
}
