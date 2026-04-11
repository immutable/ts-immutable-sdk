import type {
  Environment,
  ConsentLevel,
  PageMessage,
  TrackMessage,
  ConsentManager,
  CmpDetector,
} from '@imtbl/audience-core';
import {
  MessageQueue,
  httpSend,
  getBaseUrl,
  INGEST_PATH,
  FLUSH_INTERVAL_MS,
  FLUSH_SIZE,
  getOrCreateAnonymousId,
  collectContext,
  generateId,
  getTimestamp,
  isBrowser,
  getCookie,
  collectAttribution,
  getOrCreateSession,
  createConsentManager,
  canTrack as consentAllowsTracking,
  startCmpDetection,
} from '@imtbl/audience-core';
import { setupAutocapture } from './autocapture';
import type { AutocaptureOptions } from './autocapture';

// Replaced at build time by tsup `define` (see tsup.config.ts).
// In tests the global isn't defined, so we fall back to 'unknown'.
const PIXEL_VERSION: string = typeof PIXEL_VERSION_INJECTED !== 'undefined'
  ? PIXEL_VERSION_INJECTED
  : 'unknown';

export interface PixelInitOptions {
  key: string;
  environment?: Environment;
  consent?: ConsentLevel;
  /** Set to 'auto' to auto-detect consent from CMPs (Google Consent Mode, IAB TCF). */
  consentMode?: 'auto';
  domain?: string;
  autocapture?: AutocaptureOptions;
}

export class Pixel {
  private queue: MessageQueue | null = null;

  private consent: ConsentManager | null = null;

  private anonymousId = '';

  private sessionId: string | undefined;

  private sessionStartTime: number | undefined;

  private environment: Environment = 'production';

  private publishableKey = '';

  private domain: string | undefined;

  private initialized = false;

  private unloadHandler?: () => void;

  private teardownAutocapture?: () => void;

  private teardownCmp?: () => void;

  private initialPageViewFired = false;

  init(options: PixelInitOptions): void {
    if (this.initialized) return;

    const {
      key,
      environment = 'production',
      consent: consentLevel,
      consentMode,
      domain,
      autocapture,
    } = options;

    this.publishableKey = key;
    this.environment = environment;
    this.domain = domain;

    const endpointUrl = `${getBaseUrl(environment)}${INGEST_PATH}`;

    this.queue = new MessageQueue(
      httpSend,
      endpointUrl,
      key,
      FLUSH_INTERVAL_MS,
      FLUSH_SIZE,
      { storagePrefix: '__imtbl_pixel_' },
    );

    this.anonymousId = getOrCreateAnonymousId(domain);

    // Resolve initial consent level.
    // 'auto' starts at 'none' until a CMP is detected.
    const isAutoConsent = consentMode === 'auto';

    this.consent = createConsentManager(
      this.queue,
      httpSend,
      key,
      this.anonymousId,
      environment,
      'pixel',
      isAutoConsent ? 'none' : consentLevel,
    );

    this.initialized = true;

    // Register session_end listener BEFORE starting the queue so that
    // on page unload, session_end is enqueued before the queue flushes.
    // DOM event listeners fire in registration order.
    this.registerSessionEnd();
    this.queue.start();

    if (isAutoConsent) {
      // CMP detection will fire the deferred page view when consent upgrades.
      this.startCmpDetection();
    } else if (consentAllowsTracking(this.consent.level)) {
      // Static consent — fire page view immediately.
      this.initialPageViewFired = true;
      this.page();
    }

    // Attach autocapture listeners (forms + outbound clicks)
    this.teardownAutocapture = setupAutocapture(
      { forms: autocapture?.forms, clicks: autocapture?.clicks },
      (eventName, properties) => this.track(eventName, properties),
      () => this.consent!.level,
    );
  }

  page(properties?: Record<string, unknown>): void {
    if (!this.canTrack()) return;

    const { sessionId, isNew } = getOrCreateSession(this.domain);
    this.refreshSession(sessionId, isNew);
    const attribution = collectAttribution();
    const thirdPartyIds = this.collectThirdPartyIds();

    const message: PageMessage = {
      ...this.buildBase(),
      type: 'page',
      properties: {
        ...attribution,
        ...thirdPartyIds,
        sessionId,
        ...properties,
      },
      userId: undefined,
    };

    this.queue!.enqueue(message);
  }

  setConsent(level: ConsentLevel): void {
    if (!this.isReady()) return;
    this.consent!.setLevel(level);

    // Fire the deferred page view if consent was upgraded from 'none'
    // (covers the case where CMP detection failed and the caller
    // manually sets consent as a fallback).
    if (consentAllowsTracking(level) && !this.initialPageViewFired) {
      this.initialPageViewFired = true;
      this.page();
    }
  }

  destroy(): void {
    this.removeSessionEnd();
    if (this.teardownCmp) {
      this.teardownCmp();
      this.teardownCmp = undefined;
    }
    if (this.teardownAutocapture) {
      this.teardownAutocapture();
      this.teardownAutocapture = undefined;
    }
    if (this.queue) {
      this.queue.destroy();
      this.queue = null;
    }
    this.consent = null;
    this.initialized = false;
  }

  // -- CMP auto-detection ---------------------------------------------------

  private startCmpDetection(): void {
    const onCmpUpdate = (level: ConsentLevel): void => {
      if (!this.isReady()) return;
      this.consent!.setLevel(level);

      // Fire the deferred page view on first consent upgrade from 'none'.
      if (consentAllowsTracking(level) && !this.initialPageViewFired) {
        this.initialPageViewFired = true;
        this.page();
      }
    };

    this.teardownCmp = startCmpDetection(
      onCmpUpdate,
      (detector: CmpDetector) => {
        // CMP found — apply the initial consent level it reported.
        if (consentAllowsTracking(detector.level)) {
          onCmpUpdate(detector.level);
        }
      },
    );
  }

  // -- Auto-capture helper --------------------------------------------------

  private track(eventName: string, properties: Record<string, unknown>): void {
    if (!this.canTrack()) return;

    const { sessionId, isNew } = getOrCreateSession(this.domain);
    this.refreshSession(sessionId, isNew);

    const message: TrackMessage = {
      ...this.buildBase(),
      type: 'track',
      eventName,
      properties: { ...properties, sessionId },
      userId: undefined,
    };

    this.queue!.enqueue(message);
  }

  // -- Session lifecycle --------------------------------------------------

  private refreshSession(sessionId: string, isNew: boolean): void {
    this.sessionId = sessionId;
    if (isNew) {
      this.sessionStartTime = Date.now();
      this.fireSessionStart(sessionId);
    }
  }

  private fireSessionStart(sessionId: string): void {
    if (!this.canTrack()) return;

    const message: TrackMessage = {
      ...this.buildBase(),
      type: 'track',
      eventName: 'session_start',
      properties: { sessionId },
      userId: undefined,
    };

    this.queue!.enqueue(message);
  }

  private fireSessionEnd(): void {
    if (!this.canTrack() || !this.sessionId) return;

    const duration = this.sessionStartTime
      ? Math.round((Date.now() - this.sessionStartTime) / 1000)
      : undefined;

    const message: TrackMessage = {
      ...this.buildBase(),
      type: 'track',
      eventName: 'session_end',
      properties: {
        sessionId: this.sessionId,
        duration,
      },
      userId: undefined,
    };

    this.queue!.enqueue(message);
  }

  private registerSessionEnd(): void {
    if (!isBrowser()) return;

    this.unloadHandler = () => {
      this.fireSessionEnd();
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.unloadHandler?.();
      }
    });
    window.addEventListener('pagehide', this.unloadHandler);
  }

  private removeSessionEnd(): void {
    if (this.unloadHandler) {
      window.removeEventListener('pagehide', this.unloadHandler);
      this.unloadHandler = undefined;
    }
  }

  // -- Third-party identity signals ----------------------------------------

  /**
   * Read GA Client ID and Meta Pixel cookies when present.
   * These are set by Google Analytics / Meta Pixel scripts and allow
   * cross-platform identity stitching without requiring full consent.
   */
  // eslint-disable-next-line class-methods-use-this
  private collectThirdPartyIds(): Record<string, string> {
    const ids: Record<string, string> = {};
    const ga = getCookie('_ga');
    if (ga) ids.gaClientId = ga;
    const fbc = getCookie('_fbc');
    if (fbc) ids.fbClickId = fbc;
    const fbp = getCookie('_fbp');
    if (fbp) ids.fbBrowserId = fbp;
    return ids;
  }

  // -- Helpers ------------------------------------------------------------

  // eslint-disable-next-line class-methods-use-this
  private buildBase() {
    return {
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'pixel' as const,
      context: collectContext('@imtbl/pixel', PIXEL_VERSION),
    };
  }

  // -- Guards -------------------------------------------------------------

  private canTrack(): boolean {
    return this.isReady() && consentAllowsTracking(this.consent!.level);
  }

  private isReady(): boolean {
    return this.initialized && this.queue !== null && this.consent !== null;
  }
}
