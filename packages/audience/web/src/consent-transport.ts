import type { ConsentTransport } from '@imtbl/audience-sdk';
import { LOG_PREFIX } from './config';

/** Fetch-based consent transport for browser environments. */
export const webConsentTransport: ConsentTransport = {
  async syncConsent(url, publishableKey, body) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-immutable-publishable-key': publishableKey,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.warn(`${LOG_PREFIX} consent sync failed: HTTP ${response.status}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`${LOG_PREFIX} consent sync failed:`, err);
    }
  },
};
