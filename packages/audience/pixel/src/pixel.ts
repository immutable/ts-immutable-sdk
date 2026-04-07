import type {
  Environment,
  ConsentLevel,
  PageMessage,
  TrackMessage,
  IdentifyMessage,
  UserTraits,
  ConsentManager,
} from '@imtbl/audience-core';
import {
  MessageQueue,
  httpTransport,
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
} from '@imtbl/audience-core';

// Replaced at build time by tsup `define` (see tsup.config.ts).
// In tests the global isn't defined, so we fall back to 'unknown'.
const PIXEL_VERSION: string = typeof PIXEL_VERSION_INJECTED !== 'undefined'
  ? PIXEL_VERSION_INJECTED
  : 'unknown';

export interface PixelInitOptions {
  key: string;
  environment?: Environment;
  consent?: ConsentLevel;
  domain?: string;
}

export class Pixel {
  private queue: MessageQueue | null = null;

  private consent: ConsentManager | null = null;

  private anonymousId = '';

  private userId: string | undefined;

  private sessionId: string | undefined;

  private sessionStartTime: number | undefined;

  private environment: Environment = 'production';

  private publishableKey = '';

  private domain: string | undefined;

  private initialized = false;

  private unloadHandler?: () => void;

  init(options: PixelInitOptions): void {
    if (this.initialized) return;

    const {
      key,
      environment = 'production',
      consent: consentLevel,
      domain,
    } = options;

    this.publishableKey = key;
    this.environment = environment;
    this.domain = domain;

    const endpointUrl = `${getBaseUrl(environment)}${INGEST_PATH}`;

    this.queue = new MessageQueue(
      httpTransport,
      endpointUrl,
      key,
      FLUSH_INTERVAL_MS,
      FLUSH_SIZE,
      { storagePrefix: '__imtbl_pixel_' },
    );

    this.anonymousId = getOrCreateAnonymousId(domain);

    this.consent = createConsentManager(
      this.queue,
      key,
      this.anonymousId,
      environment,
      consentLevel,
    );

    this.initialized = true;

    // Register session_end listener BEFORE starting the queue so that
    // on page unload, session_end is enqueued before the queue flushes.
    // DOM event listeners fire in registration order.
    this.registerSessionEnd();
    this.queue.start();

    // Auto-fire page view if consent allows
    if (this.consent.level !== 'none') {
      this.page();
    }
  }

  page(properties?: Record<string, unknown>): void {
    if (!this.canTrack()) return;

    const { sessionId, isNew } = getOrCreateSession(this.domain);
    this.refreshSession(sessionId, isNew);
    const attribution = collectAttribution();
    const thirdPartyIds = this.collectThirdPartyIds();
    const context = collectContext('@imtbl/pixel', PIXEL_VERSION);

    const message: PageMessage = {
      type: 'page',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'pixel',
      context,
      properties: {
        ...attribution,
        ...thirdPartyIds,
        sessionId,
        ...properties,
      },
      userId: this.consent!.level === 'full' ? this.userId : undefined,
    };

    this.queue!.enqueue(message);
  }

  identify(userId: string, traits?: UserTraits): void {
    if (!this.isReady() || this.consent!.level !== 'full') return;

    this.userId = userId;
    const { sessionId, isNew } = getOrCreateSession(this.domain);
    this.refreshSession(sessionId, isNew);
    const context = collectContext('@imtbl/pixel', PIXEL_VERSION);

    const message: IdentifyMessage = {
      type: 'identify',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'pixel',
      context,
      userId,
      traits: {
        ...traits,
        sessionId,
      } as UserTraits,
    };

    this.queue!.enqueue(message);
  }

  setConsent(level: ConsentLevel): void {
    if (!this.isReady()) return;
    this.consent!.setLevel(level);
  }

  destroy(): void {
    this.removeSessionEnd();
    if (this.queue) {
      this.queue.destroy();
      this.queue = null;
    }
    this.consent = null;
    this.initialized = false;
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
      type: 'track',
      eventName: 'session_start',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'pixel',
      context: collectContext('@imtbl/pixel', PIXEL_VERSION),
      properties: { sessionId },
      userId: this.consent!.level === 'full' ? this.userId : undefined,
    };

    this.queue!.enqueue(message);
  }

  private fireSessionEnd(): void {
    if (!this.canTrack() || !this.sessionId) return;

    const duration = this.sessionStartTime
      ? Math.round((Date.now() - this.sessionStartTime) / 1000)
      : undefined;

    const message: TrackMessage = {
      type: 'track',
      eventName: 'session_end',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'pixel',
      context: collectContext('@imtbl/pixel', PIXEL_VERSION),
      properties: {
        sessionId: this.sessionId,
        duration,
      },
      userId: this.consent!.level === 'full' ? this.userId : undefined,
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

  // -- Guards -------------------------------------------------------------

  private canTrack(): boolean {
    return this.isReady() && this.consent!.level !== 'none';
  }

  private isReady(): boolean {
    return this.initialized && this.queue !== null && this.consent !== null;
  }
}
