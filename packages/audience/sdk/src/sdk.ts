import type {
  ConsentLevel,
  ConsentManager,
  TrackMessage,
  PageMessage,
  IdentifyMessage,
  AliasMessage,
  UserTraits,
} from '@imtbl/audience-core';
import {
  MessageQueue,
  httpTransport,
  getBaseUrl,
  INGEST_PATH,
  FLUSH_INTERVAL_MS,
  FLUSH_SIZE,
  COOKIE_NAME,
  SESSION_COOKIE,
  getOrCreateAnonymousId,
  getOrCreateSession,
  deleteCookie,
  generateId,
  getTimestamp,
  createConsentManager,
  collectAttribution,
} from '@imtbl/audience-core';
import type { AudienceSDKConfig } from './types';
import { collectContext } from './context';
import { DebugLogger } from './debug';

export class ImmutableAudienceSDK {
  private queue: MessageQueue;

  private consent: ConsentManager;

  private anonymousId: string;

  private userId: string | undefined;

  private debug: DebugLogger;

  private config: Required<Pick<AudienceSDKConfig, 'publishableKey' | 'environment'>> & AudienceSDKConfig;

  private destroyed = false;

  constructor(config: AudienceSDKConfig) {
    const {
      publishableKey,
      environment,
      consent: consentLevel = 'none',
      debug: enableDebug = false,
      cookieDomain,
      flushInterval = FLUSH_INTERVAL_MS,
      flushSize = FLUSH_SIZE,
    } = config;

    this.config = config;
    this.debug = new DebugLogger(enableDebug);

    const endpointUrl = `${getBaseUrl(environment)}${INGEST_PATH}`;

    this.queue = new MessageQueue(
      httpTransport,
      endpointUrl,
      publishableKey,
      flushInterval,
      flushSize,
      {
        storagePrefix: '__imtbl_web_',
        onFlush: (ok, count) => this.debug.logFlush(ok, count),
      },
    );

    this.anonymousId = getOrCreateAnonymousId(cookieDomain);

    this.consent = createConsentManager(
      this.queue,
      publishableKey,
      this.anonymousId,
      environment,
      consentLevel,
    );

    this.queue.start();
  }

  // -- Public API ---------------------------------------------------------

  page(properties?: Record<string, unknown>): void {
    if (!this.canTrack()) return;

    const { sessionId } = this.touchSession();
    const attribution = collectAttribution();
    const context = collectContext();

    const message: PageMessage = {
      type: 'page',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context,
      properties: { ...attribution, sessionId, ...properties },
      userId: this.consent.level === 'full' ? this.userId : undefined,
    };

    this.debug.logEvent('page', message);
    this.queue.enqueue(message);
  }

  track(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.canTrack()) return;

    const { sessionId } = this.touchSession();
    const context = collectContext();

    const message: TrackMessage = {
      type: 'track',
      eventName,
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context,
      properties: { sessionId, ...properties },
      userId: this.consent.level === 'full' ? this.userId : undefined,
    };

    this.debug.logEvent('track', message);
    this.queue.enqueue(message);
  }

  identify(userId: string, traits?: UserTraits): void {
    if (this.destroyed || this.consent.level !== 'full') return;

    this.userId = userId;
    const { sessionId } = this.touchSession();
    const context = collectContext();

    const message: IdentifyMessage = {
      type: 'identify',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context,
      userId,
      traits: { ...traits, sessionId } as UserTraits,
    };

    this.debug.logEvent('identify', message);
    this.queue.enqueue(message);
  }

  alias(fromId: string, toId: string, fromType?: string, toType?: string): void {
    if (!this.canTrack()) return;

    const context = collectContext();

    const message: AliasMessage = {
      type: 'alias',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context,
      fromId,
      toId,
      fromType,
      toType,
    };

    this.debug.logEvent('alias', message);
    this.queue.enqueue(message);
  }

  setConsent(level: ConsentLevel): void {
    if (this.destroyed) return;
    const previous = this.consent.level;
    this.consent.setLevel(level);

    // Clear cookies on revocation (core handles queue purge)
    if (level === 'none') {
      deleteCookie(COOKIE_NAME, this.config.cookieDomain);
      deleteCookie(SESSION_COOKIE, this.config.cookieDomain);
    }

    this.debug.logConsent(previous, level);
  }

  reset(): void {
    this.userId = undefined;
  }

  destroy(): void {
    this.destroyed = true;
    this.queue.destroy();
  }

  // -- Internals ----------------------------------------------------------

  private canTrack(): boolean {
    return !this.destroyed && this.consent.level !== 'none';
  }

  private touchSession() {
    return getOrCreateSession(this.config.cookieDomain);
  }
}
