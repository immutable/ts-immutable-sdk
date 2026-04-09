import { track, trackError } from '@imtbl/metrics';
import type { BatchPayload, ConsentUpdatePayload } from './types';
import { TransportError, type TransportResult } from './errors';

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
 * Implementations MUST NOT reject — failures are returned via
 * {@link TransportResult}. Callers rely on this contract for
 * fire-and-forget code paths (page-unload flush).
 */
export type HttpSend = (
  url: string,
  publishableKey: string,
  payload: BatchPayload | ConsentUpdatePayload,
  options?: TransportOptions,
) => Promise<TransportResult>;

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
  try {
    const response = await fetch(url, {
      method: options?.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-immutable-publishable-key': publishableKey,
      },
      body: JSON.stringify(payload),
      keepalive: options?.keepalive,
    });

    if (!response.ok) {
      const body = await parseBody(response);
      track('audience', 'transport_send_failed', { status: response.status });
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
    trackError('audience', 'transport_send', error);
    return { ok: false, error };
  }
};
