import { track } from '@imtbl/metrics';
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

/**
 * Detect browser-level privacy opt-out signals.
 *
 * Returns `true` if the user has set GPC (Global Privacy Control) or DNT
 * (Do Not Track). GPC is checked first as it carries legal weight under
 * CCPA/CPRA in California.
 */
export function detectDoNotTrack(): boolean {
  if (typeof navigator === 'undefined') return false;
  if ((navigator as unknown as Record<string, unknown>).globalPrivacyControl === true) return true;
  return navigator.doNotTrack === '1';
}

/**
 * Create a consent state machine.
 *
 * - Default level is `'none'` (no collection).
 * - If GPC or DNT is detected, consent is forced to `'none'` regardless of
 *   `initialLevel`. Studios using a CMP that has already obtained explicit
 *   user consent can upgrade via `setLevel` after init.
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
  const gpcActive = detectDoNotTrack();
  if (gpcActive) {
    const nav = navigator as unknown as Record<string, unknown>;
    track('audience', 'gpc_consent_overridden', {
      signal: nav.globalPrivacyControl === true ? 'gpc' : 'dnt',
      requestedLevel: initialLevel ?? 'none',
      context: 'init',
    });
  }
  let current: ConsentLevel = gpcActive ? 'none' : (initialLevel ?? 'none');

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
      const gpcBlocked = detectDoNotTrack();
      const effective = gpcBlocked ? 'none' : next;

      if (gpcBlocked && effective !== next) {
        const nav = navigator as unknown as Record<string, unknown>;
        track('audience', 'gpc_consent_overridden', {
          signal: nav.globalPrivacyControl === true ? 'gpc' : 'dnt',
          requestedLevel: next,
          context: 'runtime',
        });
      }

      if (effective === current) return;

      const isDowngrade = LEVELS[effective] < LEVELS[current];

      if (isDowngrade) {
        if (effective === 'none') {
          queue.purge(() => true);
        } else if (effective === 'anonymous') {
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

      current = effective;
      notifyBackend(effective);
    },
  };

  return manager;
}
