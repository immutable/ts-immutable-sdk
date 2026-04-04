import type { MessagesRequest } from './types';

/**
 * Send a batch of messages to the backend.
 *
 * Uses fetch with optional keepalive flag for page-unload resilience.
 * sendBeacon is NOT used because the backend requires the
 * x-immutable-publishable-key header, which sendBeacon cannot set.
 */
export async function sendMessages(
  url: string,
  publishableKey: string,
  payload: MessagesRequest,
  keepalive = false,
): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-immutable-publishable-key': publishableKey,
      },
      body: JSON.stringify(payload),
      keepalive,
    });
    return response.ok;
  } catch {
    return false;
  }
}
