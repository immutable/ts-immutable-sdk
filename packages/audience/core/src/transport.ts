import { track, trackError } from '@imtbl/metrics';
import type { BatchPayload, ConsentUpdatePayload } from './types';

export interface TransportOptions {
  method?: string;
  keepalive?: boolean;
}

export interface Transport {
  send(url: string, publishableKey: string, payload: BatchPayload, options?: TransportOptions): Promise<boolean>;
}

export async function httpSend(
  url: string,
  publishableKey: string,
  payload: BatchPayload | ConsentUpdatePayload,
  options?: TransportOptions,
): Promise<boolean> {
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
      track('audience', 'transport_send_failed', { status: response.status });
    }

    return response.ok;
  } catch (error) {
    trackError('audience', 'transport_send', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}

export const httpTransport: Transport = { send: httpSend };
