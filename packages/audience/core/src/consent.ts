import { track } from '@imtbl/metrics';
import type {
  ConsentLevel, ConsentUpdatePayload,
} from './types';
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
 * Resolve which privacy signal is active. Only call when detectDoNotTrack() is true.
 */
export function resolvePrivacySignal(): 'gpc' | 'dnt' {
  if (typeof navigator === 'undefined') return 'dnt';
  return (navigator as unknown as Record<string, unknown>).globalPrivacyControl === true
    ? 'gpc'
    : 'dnt';
}

/**
 * Create a consent state machine.
 *
 * - Default level is `'none'` (no collection).
 * - If GPC or DNT is detected, consent is forced to `'none'` regardless of
 *   `initialLevel`. Upgrades via `setLevel` are also blocked while the signal
 *   remains active.
 * - Already-queued events are never mutated on a consent change. Each event
 *   keeps the `consentLevel` (and any `userId`) it carried when it was
 *   recorded. Consent only gates what is collected going forward.
 * - Fires PUT to `/v1/audience/tracking-consent` on every state change via
 *   the injected `send`, keeping the transport layer uniform across surfaces.
 * - On consent sync failure, fires `onError` with a public {@link AudienceError}
 *   mapped via {@link toAudienceError}, so callers don't have to repeat the
 *   `status === 0` to `NETWORK_ERROR` mapping themselves. Exceptions thrown
 *   from the callback are swallowed.
 */
export function createConsentManager(
  send: HttpSend,
  publishableKey: string,
  anonymousId: string,
  source: string,
  initialLevel?: ConsentLevel,
  onError?: (err: AudienceError) => void,
  baseUrl?: string,
): ConsentManager {
  const privacySignalActive = detectDoNotTrack();
  if (privacySignalActive) {
    track('audience', 'gpc_consent_overridden', {
      signal: resolvePrivacySignal(),
      requestedLevel: initialLevel ?? 'none',
      context: 'init',
      publishableKey,
    });
  }
  let current: ConsentLevel = privacySignalActive ? 'none' : (initialLevel ?? 'none');

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
      const signalActive = detectDoNotTrack();
      const effective = signalActive ? 'none' : next;

      if (signalActive && effective !== next) {
        track('audience', 'gpc_consent_overridden', {
          signal: resolvePrivacySignal(),
          requestedLevel: next,
          context: 'runtime',
          publishableKey,
        });
      }

      if (effective === current) return;

      current = effective;
      notifyBackend(effective);
    },
  };

  return manager;
}
