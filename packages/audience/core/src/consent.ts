import type {
  ConsentLevel, ConsentUpdatePayload, Message,
} from './types';
import type { MessageQueue } from './queue';
import type { HttpSend } from './transport';
import { type AudienceError, invokeOnError, toAudienceError } from './errors';
import { BASE_URL, CONSENT_PATH } from './config';

export interface ConsentManager {
  level: ConsentLevel;
  setLevel(next: ConsentLevel): void;
}

export function canTrack(level: ConsentLevel): boolean {
  return level !== 'none';
}

export function canIdentify(level: ConsentLevel): boolean {
  return level === 'full';
}

export function detectDoNotTrack(): boolean {
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
 * - On downgrade (e.g. full -> anonymous), strips `userId` from queued messages.
 * - On downgrade to `'none'`, purges the queue entirely.
 * - Fires PUT to `/v1/audience/tracking-consent` on every state change via
 *   the injected `send`. Sharing the same `HttpSend` instance with the queue
 *   keeps the transport layer uniform — no module-level mocking required.
 * - On consent sync failure, fires `onError` with a public {@link AudienceError}
 *   mapped via {@link toAudienceError}, so callers don't have to repeat the
 *   `status === 0 → NETWORK_ERROR` mapping themselves. Exceptions thrown
 *   from the callback are swallowed.
 */
export function createConsentManager(
  queue: MessageQueue,
  send: HttpSend,
  publishableKey: string,
  anonymousId: string,
  source: string,
  initialLevel?: ConsentLevel,
  onError?: (err: AudienceError) => void,
  baseUrl?: string,
): ConsentManager {
  const dntDetected = detectDoNotTrack();
  let current: ConsentLevel = initialLevel ?? (dntDetected ? 'none' : 'none');

  const LEVELS: Record<ConsentLevel, number> = { none: 0, anonymous: 1, full: 2 };

  function notifyBackend(level: ConsentLevel): void {
    const url = `${baseUrl ?? BASE_URL}${CONSENT_PATH}`;
    const payload: ConsentUpdatePayload = { anonymousId, status: level, source };
    // Fire-and-forget. HttpSend never rejects, so the floating chain is safe.
    send(url, publishableKey, payload, { method: 'PUT', keepalive: true })
      .then((result) => {
        if (!result.ok && result.error) {
          invokeOnError(onError, toAudienceError(result.error, 'consent'));
        }
      });
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
          // Remove identify/alias messages, strip userId from the rest, and
          // downgrade the stamped consentLevel. The rewrite only touches
          // messages that already carry a consentLevel (the pixel stamps every
          // message; the web SDK does not yet), so surfaces that haven't opted
          // into the field are left exactly as before.
          queue.purge((msg: Message) => msg.type === 'identify' || msg.type === 'alias');
          queue.transform((msg: Message) => {
            const downgraded = 'consentLevel' in msg
              ? ({ ...msg, consentLevel: 'anonymous' as const } as Message)
              : msg;
            if ('userId' in downgraded) {
              const { userId, ...rest } = downgraded;
              return rest as Message;
            }
            return downgraded;
          });
        }
      }

      current = next;
      notifyBackend(next);
    },
  };

  return manager;
}
