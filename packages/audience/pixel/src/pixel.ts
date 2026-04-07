import type {
  Environment,
  ConsentLevel,
  PageMessage,
  TrackMessage,
  IdentifyMessage,
  UserTraits,
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
} from '@imtbl/audience-core';
import { collectAttribution } from './attribution';
import { getOrCreateSession } from './session';
import { createConsentManager, ConsentManager } from './consent';

const PIXEL_VERSION = '0.0.0';

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

  // -- Guards -------------------------------------------------------------

  private canTrack(): boolean {
    return this.isReady() && this.consent!.level !== 'none';
  }

  private isReady(): boolean {
    return this.initialized && this.queue !== null && this.consent !== null;
  }
}
