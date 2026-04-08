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
      'pixel',
      consentLevel,
    );

    this.queue.start();
    this.initialized = true;

    // Auto-fire page view if consent allows
    if (this.consent.level !== 'none') {
      this.page();
    }

    this.registerSessionEnd();
  }

  page(properties?: Record<string, unknown>): void {
    if (!this.canTrack()) return;

    const { sessionId, isNew } = getOrCreateSession(this.domain);
    this.refreshSession(sessionId, isNew);
    const attribution = collectAttribution();

    const message: PageMessage = {
      ...this.buildBase(),
      type: 'page',
      properties: {
        ...attribution,
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

    const message: IdentifyMessage = {
      ...this.buildBase(),
      type: 'identify',
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
      ...this.buildBase(),
      type: 'track',
      eventName: 'session_start',
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
      ...this.buildBase(),
      type: 'track',
      eventName: 'session_end',
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
    return this.isReady() && this.consent!.level !== 'none';
  }

  private isReady(): boolean {
    return this.initialized && this.queue !== null && this.consent !== null;
  }
}
