import type { BatchPayload } from '../types';

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
    return response.ok;
  } catch {
    return false;
  }
}

export const httpTransport: Transport = { send: httpSend };
