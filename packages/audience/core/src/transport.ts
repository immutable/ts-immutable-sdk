import { track, trackError } from '@imtbl/metrics';
import type { BatchPayload, ConsentUpdatePayload } from './types';
import type { TransportError, TransportResult } from './errors';

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
      const error: TransportError = {
        status: response.status,
        endpoint: url,
        body,
      };
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    const causeError = err instanceof Error ? err : new Error(String(err));
    trackError('audience', 'transport_send', causeError);
    return {
      ok: false,
      error: {
        status: 0,
        endpoint: url,
        body: undefined,
        cause: err,
      },
    };
  }
};
