import type {
  ConsentLevel, Message, Environment, MessageQueue,
} from '@imtbl/audience-core';
import { CONSENT_PATH, getBaseUrl } from '@imtbl/audience-core';

export interface ConsentManager {
  level: ConsentLevel;
  setLevel(next: ConsentLevel): void;
}

function detectDoNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false;
  // DNT header
  if (navigator.doNotTrack === '1') return true;
  // Global Privacy Control
  if ((navigator as unknown as Record<string, unknown>).globalPrivacyControl === true) return true;
  return false;
}

/**
 * Create a consent state machine.
 *
 * - Default level is `'none'` (no collection).
 * - If DNT or GPC is detected and no explicit consent is provided, stays `'none'`.
 * - On downgrade (e.g. full → anonymous), strips `userId` from queued messages.
 * - On downgrade to `'none'`, purges the queue entirely.
 * - Fires PUT to `/v1/audience/tracking-consent` on every state change.
 */
export function createConsentManager(
  queue: MessageQueue,
  publishableKey: string,
  anonymousId: string,
  environment: Environment,
  initialLevel?: ConsentLevel,
): ConsentManager {
  const dntDetected = detectDoNotTrack();
  let current: ConsentLevel = initialLevel ?? (dntDetected ? 'none' : 'none');

  const LEVELS: Record<ConsentLevel, number> = { none: 0, anonymous: 1, full: 2 };

  function notifyBackend(level: ConsentLevel): void {
    const url = `${getBaseUrl(environment)}${CONSENT_PATH}`;
    const payload = { anonymousId, consentLevel: level };
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-immutable-publishable-key': publishableKey,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }

  const manager: ConsentManager = {
    get level() {
      return current;
    },

    setLevel(next: ConsentLevel): void {
      if (next === current) return;

      const isDowngrade = LEVELS[next] < LEVELS[current];

      if (isDowngrade) {
        if (next === 'none') {
          // Purge all queued messages
          queue.purge(() => true);
        } else if (next === 'anonymous') {
          // Strip userId from queued messages
          queue.transform((msg: Message) => {
            if ('userId' in msg) {
              const { userId, ...rest } = msg;
              return rest as Message;
            }
            return msg;
          });
        }
      }

      current = next;
      notifyBackend(next);
    },
  };

  return manager;
}
