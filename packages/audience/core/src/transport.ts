import type { BatchPayload } from './types';

export interface Transport {
  send(url: string, apiKey: string, payload: BatchPayload): Promise<boolean>;
}

async function httpSend(
  url: string,
  apiKey: string,
  payload: BatchPayload,
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-immutable-publishable-key': apiKey,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const httpTransport: Transport = { send: httpSend };
