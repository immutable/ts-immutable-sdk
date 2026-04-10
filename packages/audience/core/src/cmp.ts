/**
 * CMP (Consent Management Platform) auto-detection.
 *
 * Detects consent state from:
 *   1. Google Consent Mode v2 (via `window.dataLayer`)
 *   2. IAB TCF v2 (via `window.__tcfapi`)
 *
 * Priority: GCM → TCF → fall back to 'none'.
 * Once a CMP is detected, registers a listener for ongoing consent changes.
 */
import type { ConsentLevel } from './types';

// -- Types for external CMP globals ------------------------------------------

interface GcmConsentParams {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  [key: string]: unknown;
}

interface TcfData {
  gdprApplies?: boolean;
  purpose?: { consents?: Record<number, boolean> };
  listenerId?: number;
  eventStatus?: string;
}

type TcfCallback = (data: TcfData, success: boolean) => void;

type TcfApi = (
  command: string,
  version: number,
  callback: TcfCallback,
  listenerId?: number,
) => void;

export type CmpSource = 'gcm' | 'tcf';

export type ConsentCallback = (level: ConsentLevel, source: CmpSource) => void;

export interface CmpDetector {
  /** The CMP source that was detected, or null if none found. */
  source: CmpSource | null;
  /** The initial consent level read from the CMP. */
  level: ConsentLevel;
  /** Stop listening for consent changes and clean up. */
  destroy: () => void;
}

// -- Google Consent Mode v2 ---------------------------------------------------

/**
 * Map GCM consent parameters to our three-tier consent level.
 */
function mapGcmConsent(params: GcmConsentParams): ConsentLevel {
  if (params.analytics_storage !== 'granted') return 'none';
  if (params.ad_storage === 'granted') return 'full';
  return 'anonymous';
}

/**
 * Scan the dataLayer for the most recent Google Consent Mode default/update
 * command and return the consent parameters, or null if none found.
 */
function readGcmFromDataLayer(
  dataLayer: unknown[],
): GcmConsentParams | null {
  let latest: GcmConsentParams | null = null;

  for (let i = 0; i < dataLayer.length; i++) {
    const entry = dataLayer[i];
    // gtag pushes [command, ...args] or {event, ...} — consent commands are:
    //   ['consent', 'default', {analytics_storage: ...}]
    //   ['consent', 'update', {analytics_storage: ...}]
    if (
      Array.isArray(entry)
      && entry[0] === 'consent'
      && (entry[1] === 'default' || entry[1] === 'update')
      && entry[2]
      && typeof entry[2] === 'object'
    ) {
      latest = entry[2] as GcmConsentParams;
    }
  }

  return latest;
}

/**
 * Try to detect Google Consent Mode v2 and listen for changes.
 * Returns a CmpDetector if GCM is present, or null.
 */
function detectGcm(onUpdate: ConsentCallback): CmpDetector | null {
  const win = window as unknown as Record<string, unknown>;
  const dataLayer = win.dataLayer as unknown[] | undefined;
  if (!Array.isArray(dataLayer)) return null;

  // Read initial state
  const initial = readGcmFromDataLayer(dataLayer);
  if (!initial) return null;

  const level = mapGcmConsent(initial);

  // Intercept future dataLayer.push() calls to watch for consent updates.
  // This catches both gtag('consent','update',...) and direct dataLayer pushes.
  const originalPush = dataLayer.push.bind(dataLayer);
  let destroyed = false;

  const interceptor = (...args: unknown[]): number => {
    const result = originalPush(...args);
    if (destroyed) return result;

    for (const arg of args) {
      if (
        Array.isArray(arg)
        && arg[0] === 'consent'
        && arg[1] === 'update'
        && arg[2]
        && typeof arg[2] === 'object'
      ) {
        onUpdate(mapGcmConsent(arg[2] as GcmConsentParams), 'gcm');
      }
    }
    return result;
  };

  dataLayer.push = interceptor;

  return {
    source: 'gcm',
    level,
    destroy() {
      destroyed = true;
      // Restore original push — only if our interceptor is still the active one
      if (dataLayer.push === interceptor) {
        dataLayer.push = originalPush;
      }
    },
  };
}

// -- IAB TCF v2 ---------------------------------------------------------------

/**
 * Map TCF purpose consents to our three-tier consent level.
 *
 * Purpose 1: Store/access info on a device
 * Purpose 3: Create personalised ads profile
 * Purpose 4: Select personalised ads
 * Purpose 5: Create personalised content profile
 *
 * Mapping:
 *   No Purpose 1 → 'none'
 *   Purpose 1 only → 'anonymous'
 *   Purpose 1 + any of (3,4,5) → 'full'
 */
function mapTcfConsent(data: TcfData): ConsentLevel {
  const purposes = data.purpose?.consents;
  if (!purposes) return 'none';
  if (!purposes[1]) return 'none';
  if (purposes[3] || purposes[4] || purposes[5]) return 'full';
  return 'anonymous';
}

/**
 * Try to detect IAB TCF v2 and listen for changes.
 * Returns a CmpDetector if TCF is present, or null.
 */
function detectTcf(onUpdate: ConsentCallback): CmpDetector | null {
  const win = window as unknown as Record<string, unknown>;
  // eslint-disable-next-line no-underscore-dangle
  const tcfapi = win.__tcfapi as TcfApi | undefined;
  if (typeof tcfapi !== 'function') return null;

  let initialLevel: ConsentLevel = 'none';
  let listenerId: number | undefined;
  let resolved = false;

  // getTCData gives us the current state synchronously (callback fires immediately
  // if CMP has already loaded consent).
  tcfapi('addEventListener', 2, (data: TcfData, success: boolean) => {
    if (!success) return;

    // Store listenerId for cleanup
    if (data.listenerId !== undefined) {
      listenerId = data.listenerId;
    }

    const level = mapTcfConsent(data);

    if (!resolved) {
      // First callback — this is the initial state
      initialLevel = level;
      resolved = true;
    } else {
      // Subsequent callbacks — consent changed
      onUpdate(level, 'tcf');
    }
  });

  // If the callback never fired synchronously, tcfapi exists but CMP hasn't
  // loaded consent yet — we'll get it via the addEventListener callback later.
  return {
    source: 'tcf',
    level: initialLevel,
    destroy() {
      if (listenerId !== undefined && typeof tcfapi === 'function') {
        tcfapi('removeEventListener', 2, () => {}, listenerId);
      }
    },
  };
}

// -- Public API ---------------------------------------------------------------

const POLL_INTERVAL = 800; // ms between retries
const MAX_POLLS = 3; // 3 attempts over ~2.4s total

/**
 * Attempt to detect a CMP on the page.
 *
 * Detection priority: Google Consent Mode v2 → IAB TCF v2 → null.
 */
export function detectCmp(onUpdate: ConsentCallback): CmpDetector | null {
  return detectGcm(onUpdate) ?? detectTcf(onUpdate) ?? null;
}

/**
 * Start CMP detection with polling for async CMP loading.
 *
 * Many CMPs load asynchronously (e.g. OneTrust script injected by a tag manager).
 * This function tries detection immediately, then polls up to MAX_POLLS times.
 * Once a CMP is found, polling stops and the callback is invoked for future changes.
 *
 * If no CMP is found after all polling attempts, `onTimeout` is called so callers
 * can distinguish "CMP said none" from "no CMP found at all".
 *
 * Returns a cleanup function that stops polling and tears down CMP listeners.
 */
export function startCmpDetection(
  onUpdate: ConsentCallback,
  onDetected: (detector: CmpDetector) => void,
  onTimeout?: () => void,
): () => void {
  // Try immediately
  let detector = detectCmp(onUpdate);
  if (detector) {
    onDetected(detector);
    return () => detector!.destroy();
  }

  // Poll for async CMP loading
  let pollCount = 0;
  const timer = setInterval(() => {
    pollCount++;
    detector = detectCmp(onUpdate);

    if (detector) {
      clearInterval(timer);
      onDetected(detector);
      return;
    }

    if (pollCount >= MAX_POLLS) {
      clearInterval(timer);
      onTimeout?.();
    }
  }, POLL_INTERVAL);

  return () => {
    clearInterval(timer);
    if (detector) detector.destroy();
  };
}
