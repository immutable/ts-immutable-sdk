import type {
  ConsentLevel,
  Message,
  TrackMessage,
  PageMessage,
  IdentifyMessage,
  AliasMessage,
  UserTraits,
} from '@imtbl/audience-core';
import {
  INGEST_PATH,
  FLUSH_INTERVAL_MS,
  FLUSH_SIZE,
  COOKIE_NAME,
  SESSION_COOKIE,
  MessageQueue,
  httpTransport,
  getBaseUrl,
  getOrCreateAnonymousId,
  getCookie,
  deleteCookie,
  generateId,
  getTimestamp,
  isAliasValid,
  isTimestampValid,
  truncate,
} from '@imtbl/audience-core';
import type { WebSDKConfig } from './types';
import { collectContext } from './context';
import { ConsentManager } from './consent';
import {
  parseAttribution,
  attributionToProperties,
  type AttributionContext,
} from './attribution';
import {
  getOrCreateSessionId,
  touchSession,
} from './cookie';
import { DebugLogger } from './debug';

const DEFAULT_CONSENT_SOURCE = 'WebSDK';

export class ImmutableWebSDK {
  private readonly queue: MessageQueue;

  private readonly consent: ConsentManager;

  private readonly attribution: AttributionContext;

  private readonly debug?: DebugLogger;

  private readonly cookieDomain?: string;

  private anonymousId: string;

  private sessionId: string | undefined;

  private sessionStartTime: number | undefined;

  private userId: string | undefined;

  private isFirstPage = true;


  private constructor(config: WebSDKConfig) {
    const {
      cookieDomain,
      environment,
      publishableKey,
    } = config;
    const consentLevel = config.consent ?? 'none';
    const consentSource = config.consentSource ?? DEFAULT_CONSENT_SOURCE;
    const flushInterval = config.flushInterval ?? FLUSH_INTERVAL_MS;
    const flushSize = config.flushSize ?? FLUSH_SIZE;

    this.cookieDomain = cookieDomain;

    if (config.debug) {
      this.debug = new DebugLogger();
    }

    this.consent = new ConsentManager(
      environment,
      publishableKey,
      consentLevel,
      consentSource,
      cookieDomain,
    );

    const effectiveConsent = this.consent.getLevel();
    let isNewSession = false;
    if (effectiveConsent !== 'none') {
      this.anonymousId = getOrCreateAnonymousId(cookieDomain);
      const session = getOrCreateSessionId(cookieDomain);
      this.sessionId = session.sessionId;
      this.sessionStartTime = Date.now();
      isNewSession = session.isNew;
    } else {
      this.anonymousId = getCookie(COOKIE_NAME) ?? generateId();
    }

    const endpointUrl = `${getBaseUrl(environment)}${INGEST_PATH}`;
    this.queue = new MessageQueue(
      httpTransport,
      endpointUrl,
      publishableKey,
      flushInterval,
      flushSize,
      {
        onFlush: config.debug
          ? (ok, count) => this.debug?.logFlush(ok, count)
          : undefined,
        staleFilter: (m) => isTimestampValid(m.eventTimestamp),
        storagePrefix: '__imtbl_web_',
      },
    );

    this.attribution = parseAttribution();

    if (effectiveConsent !== 'none') {
      this.queue.start();

      if (isNewSession) {
        this.trackSessionStart();
      }
    }

  }

  static init(config: WebSDKConfig): ImmutableWebSDK {
    return new ImmutableWebSDK(config);
  }

  // --- Session lifecycle ---

  private trackSessionStart(): void {
    if (!this.sessionId) return;
    const message: TrackMessage = {
      type: 'track',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context: collectContext(),
      eventName: 'session_start',
      properties: { sessionId: this.sessionId },
    };
    this.queue.enqueue(message);
    this.debug?.logEvent('track(session_start)', message);
  }

  private trackSessionEnd(): void {
    if (!this.sessionId) return;
    const properties: Record<string, unknown> = {
      sessionId: this.sessionId,
    };
    if (this.sessionStartTime) {
      properties.duration = Math.round(
        (Date.now() - this.sessionStartTime) / 1000,
      );
    }
    const message: TrackMessage = {
      type: 'track',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context: collectContext(),
      eventName: 'session_end',
      properties,
    };
    this.queue.enqueue(message);
    this.debug?.logEvent('track(session_end)', message);
  }

  // --- Page tracking (manual — studios call sdk.page() on route changes) ---

  page(properties?: Record<string, unknown>): void {
    if (this.consent.getLevel() === 'none') return;
    touchSession(this.cookieDomain);

    const mergedProps: Record<string, unknown> = { ...properties };

    if (this.isFirstPage) {
      Object.assign(mergedProps, attributionToProperties(this.attribution));
      this.isFirstPage = false;
    }

    const message: PageMessage = {
      type: 'page',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context: collectContext(),
      properties: Object.keys(mergedProps).length > 0
        ? mergedProps
        : undefined,
      userId: this.consent.getLevel() === 'full'
        ? this.userId
        : undefined,
    };

    this.queue.enqueue(message);
    this.debug?.logEvent('page', message);
  }

  // --- Event tracking ---

  track(event: string, properties?: Record<string, unknown>): void {
    if (this.consent.getLevel() === 'none') return;
    touchSession(this.cookieDomain);

    const message: TrackMessage = {
      type: 'track',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context: collectContext(),
      eventName: truncate(event),
      properties,
      userId: this.consent.getLevel() === 'full'
        ? this.userId
        : undefined,
    };

    this.queue.enqueue(message);
    this.debug?.logEvent('track', message);
  }

  // --- Identity ---

  identify(uid: string, provider: string, traits?: UserTraits): void;

  identify(traits: UserTraits): void;

  identify(
    uidOrTraits: string | UserTraits,
    provider?: string,
    traits?: UserTraits,
  ): void {
    if (this.consent.getLevel() !== 'full') {
      this.debug?.logWarning(
        'identify() requires full consent — call ignored.',
      );
      return;
    }
    touchSession(this.cookieDomain);

    if (typeof uidOrTraits === 'object') {
      const message: IdentifyMessage = {
        type: 'identify',
        messageId: generateId(),
        eventTimestamp: getTimestamp(),
        anonymousId: this.anonymousId,
        surface: 'web',
        context: collectContext(),
        traits: uidOrTraits,
      };
      this.queue.enqueue(message);
      this.debug?.logEvent('identify', message);
      return;
    }

    this.userId = truncate(uidOrTraits);

    const message: IdentifyMessage = {
      type: 'identify',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context: collectContext(),
      userId: truncate(uidOrTraits),
      identityType: provider,
      traits,
    };

    this.queue.enqueue(message);
    this.debug?.logEvent('identify', message);
  }

  alias(
    from: { uid: string; provider: string },
    to: { uid: string; provider: string },
  ): void {
    if (this.consent.getLevel() !== 'full') {
      this.debug?.logWarning(
        'alias() requires full consent — call ignored.',
      );
      return;
    }
    if (!isAliasValid(from.uid, from.provider, to.uid, to.provider)) {
      this.debug?.logWarning(
        'alias() from and to are identical — call ignored.',
      );
      return;
    }
    touchSession(this.cookieDomain);

    const message: AliasMessage = {
      type: 'alias',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context: collectContext(),
      fromId: truncate(from.uid),
      fromType: from.provider,
      toId: truncate(to.uid),
      toType: to.provider,
    };

    this.queue.enqueue(message);
    this.debug?.logEvent('alias', message);
  }

  // --- Consent ---

  setConsent(level: ConsentLevel): void {
    const previous = this.consent.getLevel();
    if (level === previous) return;

    this.debug?.logConsent(previous, level);

    this.consent.setLevel(level, this.anonymousId, {
      onPurgeQueue: () => {
        this.queue.stop();
        this.queue.clear();
      },
      onStripIdentity: () => {
        this.userId = undefined;
        this.queue.purge(
          (m) => m.type === 'identify' || m.type === 'alias',
        );
        this.queue.transform((m) => {
          if ('userId' in m && m.userId) {
            const cleaned = { ...m };
            delete (cleaned as Record<string, unknown>).userId;
            return cleaned as Message;
          }
          return m;
        });
      },
      onClearCookies: () => {
        this.consent.clearCookies();
      },
    });

    if (previous === 'none' && level !== 'none') {
      this.anonymousId = getOrCreateAnonymousId(this.cookieDomain);
      const session = getOrCreateSessionId(this.cookieDomain);
      this.sessionId = session.sessionId;
      this.sessionStartTime = Date.now();
      this.queue.start();

      if (session.isNew) {
        this.trackSessionStart();
      }
    }
  }

  // --- Lifecycle ---

  reset(): void {
    this.userId = undefined;
    deleteCookie(COOKIE_NAME, this.cookieDomain);
    deleteCookie(SESSION_COOKIE, this.cookieDomain);
    if (this.consent.getLevel() !== 'none') {
      this.anonymousId = getOrCreateAnonymousId(this.cookieDomain);
      const session = getOrCreateSessionId(this.cookieDomain);
      this.sessionId = session.sessionId;
      this.sessionStartTime = Date.now();
    } else {
      this.anonymousId = generateId();
      this.sessionId = undefined;
      this.sessionStartTime = undefined;
    }
    this.isFirstPage = true;
  }

  async flush(): Promise<void> {
    await this.queue.flush();
  }

  shutdown(): void {
    this.trackSessionEnd();
    this.queue.destroy();
  }
}
