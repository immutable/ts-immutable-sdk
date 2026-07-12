import type {
  ConsentLevel,
  PageMessage,
  TrackMessage,
  ConsentManager,
  CmpDetector,
} from '@imtbl/audience-core';
import {
  MessageQueue,
  httpSend,
  getOrCreateAnonymousId,
  collectContext,
  generateId,
  getTimestamp,
  isBrowser,
  getCookie,
  collectSessionAttribution,
  getOrCreateSession,
  createConsentManager,
  canTrack,
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
  consent?: ConsentLevel;
  /** Set to 'auto' to auto-detect consent from CMPs (Google Consent Mode, IAB TCF). */
  consentMode?: 'auto';
  domain?: string;
  autocapture?: AutocaptureOptions;
  /** Override the default API base URL. */
  baseUrl?: string;
  /** When true, all events are marked test: true and can be filtered from production analytics. */
  testMode?: boolean;
}

export class Pixel {
  private queue: MessageQueue | null = null;

  private consent: ConsentManager | null = null;

  private anonymousId = '';

  private sessionId: string | undefined;

  private sessionStartTime: number | undefined;

  private publishableKey = '';

  private domain: string | undefined;

  private testMode = false;

  private initialized = false;

  private unloadHandler?: () => void;

  private teardownAutocapture?: () => void;

  private resetScrollDepth?: () => void;

  private teardownCmp?: () => void;

  private initialPageViewFired = false;

  init(options: PixelInitOptions): void {
    if (this.initialized) return;

    const {
      key,
      consent: consentLevel,
      consentMode,
      domain,
      autocapture,
    } = options;

    this.publishableKey = key;
    this.domain = domain;
    this.testMode = options.testMode ?? false;

    this.queue = new MessageQueue(
      httpSend,
      key,
      { baseUrl: options.baseUrl, storagePrefix: '__imtbl_pixel_' },
    );

    this.anonymousId = getOrCreateAnonymousId(domain);

    // Resolve initial consent level.
    // 'auto' starts at 'none' until a CMP is detected.
    const isAutoConsent = consentMode === 'auto';

    this.consent = createConsentManager(
      httpSend,
      key,
      this.anonymousId,
      'pixel',
      isAutoConsent ? 'none' : consentLevel,
      undefined,
      options.baseUrl,
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
    } else if (canTrack(this.consent.level)) {
      // Static consent — fire page view immediately.
      this.initialPageViewFired = true;
      this.page();
    }

    const autocaptureResult = setupAutocapture(
      { forms: autocapture?.forms, clicks: autocapture?.clicks, scroll: autocapture?.scroll },
      (eventName, properties) => this.track(eventName, properties),
      () => this.consent!.level,
    );
    this.teardownAutocapture = autocaptureResult.teardown;
    this.resetScrollDepth = autocaptureResult.resetScroll;
  }

  page(properties?: Record<string, unknown>): void {
    if (!this.isTrackingAllowed()) return;

    // Reset scroll milestones so each page view starts from 0.
    this.resetScrollDepth?.();

    const { sessionId, isNew } = getOrCreateSession(this.domain);
    this.refreshSession(sessionId, isNew);
    const attribution = collectSessionAttribution();
    const thirdPartyIds = this.collectThirdPartyIds();

    const message: PageMessage = {
      ...this.buildBase(),
      type: 'page',
      properties: {
        ...attribution,
        ...thirdPartyIds,
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
    if (canTrack(level) && !this.initialPageViewFired) {
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
    this.resetScrollDepth = undefined;
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
      if (canTrack(level) && !this.initialPageViewFired) {
        this.initialPageViewFired = true;
        this.page();
      }
    };

    this.teardownCmp = startCmpDetection(
      onCmpUpdate,
      (detector: CmpDetector) => {
        // CMP found — apply the initial consent level it reported.
        if (canTrack(detector.level)) {
          onCmpUpdate(detector.level);
        }
      },
    );
  }

  // -- Auto-capture helper --------------------------------------------------

  private track(eventName: string, properties: Record<string, unknown>): void {
    if (!this.isTrackingAllowed()) return;

    const { sessionId, isNew } = getOrCreateSession(this.domain);
    this.refreshSession(sessionId, isNew);

    const message: TrackMessage = {
      ...this.buildBase(),
      type: 'track',
      eventName,
      properties,
      userId: undefined,
    };

    this.queue!.enqueue(message);
  }

  // -- Session lifecycle --------------------------------------------------

  private refreshSession(sessionId: string, isNew: boolean): void {
    this.sessionId = sessionId;
    if (isNew) {
      this.sessionStartTime = Date.now();
      this.fireSessionStart();
    }
  }

  private fireSessionStart(): void {
    if (!this.isTrackingAllowed()) return;

    const message: TrackMessage = {
      ...this.buildBase(),
      type: 'track',
      eventName: 'session_start',
      userId: undefined,
    };

    this.queue!.enqueue(message);
  }

  private fireSessionEnd(): void {
    if (!this.isTrackingAllowed() || !this.sessionId) return;

    const duration = this.sessionStartTime
      ? Math.round((Date.now() - this.sessionStartTime) / 1000)
      : undefined;

    const message: TrackMessage = {
      ...this.buildBase(),
      type: 'track',
      eventName: 'session_end',
      properties: { duration },
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
    if (ga) ids.ga_client_id = ga;
    const fbc = getCookie('_fbc');
    if (fbc) ids.fb_click_id = fbc;
    const fbp = getCookie('_fbp');
    if (fbp) ids.fb_browser_id = fbp;
    return ids;
  }

  // -- Helpers ------------------------------------------------------------

  private buildBase() {
    return {
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'pixel' as const,
      context: collectContext('@imtbl/pixel', PIXEL_VERSION),
      consentLevel: this.consent!.level,
      sessionId: this.sessionId,
      ...(this.testMode && { test: true as const }),
    };
  }

  // -- Guards -------------------------------------------------------------

  private isTrackingAllowed(): boolean {
    return this.isReady() && canTrack(this.consent!.level);
  }

  private isReady(): boolean {
    return this.initialized && this.queue !== null && this.consent !== null;
  }
}
