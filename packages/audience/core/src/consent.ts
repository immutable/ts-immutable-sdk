import type {
  ConsentLevel, ConsentUpdatePayload, Message, Environment,
} from './types';
import type { MessageQueue } from './queue';
import type { HttpSend } from './transport';
import { type AudienceError, invokeOnError, toAudienceError } from './errors';
import { CONSENT_PATH, getBaseUrl } from './config';

export interface ConsentManager {
  level: ConsentLevel;
  setLevel(next: ConsentLevel): void;
}

// --- Consent capability queries ---
// Single source of truth for what each consent level permits. Use these
// instead of raw string comparisons so rule changes only touch this file.

/** Can this consent level record events (page views, track calls)? */
export function canTrack(level: ConsentLevel): boolean {
  return level !== 'none';
}

/** Can this consent level use identity features (identify, alias, userId, email hash)? */
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
  environment: Environment,
  source: string,
  initialLevel?: ConsentLevel,
  onError?: (err: AudienceError) => void,
): ConsentManager {
  const dntDetected = detectDoNotTrack();
  let current: ConsentLevel = initialLevel ?? (dntDetected ? 'none' : 'none');

  const LEVELS: Record<ConsentLevel, number> = { none: 0, anonymous: 1, full: 2 };

  function notifyBackend(level: ConsentLevel): void {
    const url = `${getBaseUrl(environment)}${CONSENT_PATH}`;
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
          // Remove identify/alias messages and strip userId from the rest
          queue.purge((msg: Message) => msg.type === 'identify' || msg.type === 'alias');
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
