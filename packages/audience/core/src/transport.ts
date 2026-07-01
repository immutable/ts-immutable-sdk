import { track, trackError } from '@imtbl/metrics';
import type { BatchPayload, ConsentUpdatePayload } from './types';
import { TransportError, type TransportResult } from './errors';
import { isBrowser } from './utils';

export interface TransportOptions {
  method?: string;
  keepalive?: boolean;
}

/**
 * Function type for sending payloads to the audience backend.
 *
 * The single production implementation is {@link httpSend}. Inject this
 * type into `MessageQueue` and `createConsentManager` so tests can
 * substitute a fake by passing `jest.fn<HttpSend>()` directly.
 *
 * Implementations MUST NOT reject; failures are returned via
 * {@link TransportResult}. Callers rely on this contract for
 * fire-and-forget code paths (page-unload flush).
 */
export type HttpSend = (
  url: string,
  publishableKey: string,
  payload?: BatchPayload | ConsentUpdatePayload,
  options?: TransportOptions,
) => Promise<TransportResult>;

const HTTP_TIMEOUT_MS = 30_000;

function parseRetryAfterMs(headers: Headers): number | null {
  const value = headers.get?.('retry-after');
  if (!value) return null;

  const seconds = Number(value.trim());
  if (!Number.isNaN(seconds) && seconds >= 0) return Math.round(seconds * 1000);

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    const ms = date.getTime() - Date.now();
    return ms > 0 ? ms : null;
  }

  return null;
}

function safeOnline(): boolean | undefined {
  try {
    return isBrowser() ? navigator.onLine : undefined;
  } catch {
    return undefined;
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers?.get?.('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch {
    return undefined;
  }
}

export const httpSend: HttpSend = async (
  url,
  publishableKey,
  payload,
  options,
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  const startTime = Date.now();

  try {
    const hasBody = payload !== undefined;
    const response = await fetch(url, {
      method: options?.method ?? 'POST',
      headers: {
        ...(hasBody && { 'Content-Type': 'application/json' }),
        'x-immutable-publishable-key': publishableKey,
      },
      ...(hasBody && { body: JSON.stringify(payload) }),
      keepalive: options?.keepalive,
      signal: controller.signal,
    });

    if (response.status === 429) {
      track('audience', 'transport_send_failed', {
        status: 429,
        online: safeOnline(),
        timeToFailureMs: Date.now() - startTime,
      });
      const retryAfterMs = parseRetryAfterMs(response.headers);
      return {
        ok: false,
        error: new TransportError({
          status: 429,
          endpoint: url,
        }),
        ...(retryAfterMs !== null ? { retryAfterMs } : {}),
      };
    }

    if (!response.ok) {
      const body = await parseBody(response);
      track('audience', 'transport_send_failed', {
        status: response.status,
        online: safeOnline(),
        timeToFailureMs: Date.now() - startTime,
      });
      return {
        ok: false,
        error: new TransportError({
          status: response.status,
          endpoint: url,
          body,
        }),
      };
    }

    // Successful HTTP, but the backend MessagesResponse may report
    // per-message validation failures via { accepted, rejected }. Treat
    // any rejection as a non-retryable failure so the queue surfaces it
    // through onError instead of silently dropping the rejected items.
    //
    // The `'rejected' in body` check is load-bearing: `typeof [] === 'object'`
    // so a bare `typeof === 'object' && !== null` cast would let arrays
    // through and silently return `undefined` for `.rejected`. The `in`
    // guard rules out arrays, primitives, and null before we cast.
    const body = await parseBody(response);
    if (
      typeof body === 'object'
      && body !== null
      && 'rejected' in body
    ) {
      const rejected = (body as { rejected?: number }).rejected ?? 0;
      if (rejected > 0) {
        track('audience', 'transport_partial_rejected', {
          status: response.status,
          rejected,
        });
        return {
          ok: false,
          error: new TransportError({
            status: response.status,
            endpoint: url,
            body,
          }),
        };
      }
    }

    return { ok: true };
  } catch (err) {
    const error = new TransportError({
      status: 0,
      endpoint: url,
      cause: err,
    });
    trackError('audience', 'transport_send', error, {
      errorName: err instanceof Error ? err.name : undefined,
      online: safeOnline(),
      timeToFailureMs: Date.now() - startTime,
    });
    return { ok: false, error };
  } finally {
    clearTimeout(timeoutId);
  }
};
