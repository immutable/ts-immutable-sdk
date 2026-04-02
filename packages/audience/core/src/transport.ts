import { track, trackError } from '@imtbl/metrics';
import type { BatchPayload } from './types';

export interface Transport {
  send(url: string, publishableKey: string, payload: BatchPayload): Promise<boolean>;
}

export async function httpSend(
  url: string,
  publishableKey: string,
  payload: BatchPayload,
): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-immutable-publishable-key': publishableKey,
      },
      body: JSON.stringify(payload),
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
