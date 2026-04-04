import type {
  WebSDKConfig,
  ConsentLevel,
  Message,
  TrackMessage,
  PageMessage,
  IdentifyMessage,
  AliasMessage,
  UserTraits,
  IdentityType,
} from './types';
import {
  AudienceEvent,
  IdentityProvider,
  type Identity,
  type EventParamMap,
} from './events';
import {
  getBaseUrl,
  MESSAGES_ENDPOINT,
  DEFAULT_FLUSH_INTERVAL_MS,
  DEFAULT_FLUSH_SIZE,
} from './config';
import { collectContext } from './context';
import { MessageQueue } from './queue';
import { ConsentManager } from './consent';
import { PageTracker } from './page';
import {
  parseAttribution,
  attributionToProperties,
  type AttributionContext,
} from './attribution';
import {
  getOrCreateAnonymousId,
  getOrCreateSessionId,
  touchSession,
  getCookie,
  ANON_ID_COOKIE,
} from './cookie';
import { generateId, getTimestamp } from './utils';
import { isAliasValid } from './validation';
import { DebugLogger } from './debug';

const DEFAULT_CONSENT_SOURCE = 'WebSDK';

export class ImmutableWebSDK {
  private readonly queue: MessageQueue;

  private readonly consent: ConsentManager;

  private readonly pageTracker: PageTracker;

  private readonly attribution: AttributionContext;

  private readonly debug?: DebugLogger;

  private readonly cookieDomain?: string;

  private anonymousId: string;

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
    const flushInterval = config.flushInterval ?? DEFAULT_FLUSH_INTERVAL_MS;
    const flushSize = config.flushSize ?? DEFAULT_FLUSH_SIZE;

    this.cookieDomain = cookieDomain;

    // Debug logger — tree-shaken in prod when debug: false
    if (config.debug) {
      this.debug = new DebugLogger();
    }

    // Consent manager — reads existing _imtbl_consent cookie, honours config
    this.consent = new ConsentManager(
      environment,
      publishableKey,
      consentLevel,
      consentSource,
      cookieDomain,
    );

    // Anonymous ID — only write cookie if consent allows
    const effectiveConsent = this.consent.getLevel();
    if (effectiveConsent !== 'none') {
      this.anonymousId = getOrCreateAnonymousId(cookieDomain);
      getOrCreateSessionId(cookieDomain);
    } else {
      // At none: read existing cookie if present, otherwise generate ephemeral ID
      this.anonymousId = getCookie(ANON_ID_COOKIE) ?? generateId();
    }

    // Message queue
    const endpointUrl = `${getBaseUrl(environment)}${MESSAGES_ENDPOINT}`;
    this.queue = new MessageQueue(
      endpointUrl,
      publishableKey,
      flushInterval,
      flushSize,
      config.debug ? (ok, count) => this.debug?.logFlush(ok, count) : undefined,
    );

    // Attribution context — captured once per session
    this.attribution = parseAttribution();

    // Page tracker
    this.pageTracker = new PageTracker((props) => this.page(props));

    // Start queue if consent allows
    if (effectiveConsent !== 'none') {
      this.queue.start();
    }

    // Auto page tracking (opt-in, default false)
    if (config.trackPageViews) {
      if (effectiveConsent !== 'none') {
        this.page();
      }
      this.pageTracker.installSPAListeners();
    }

    // Reconcile local consent with server (non-blocking)
    this.reconcileServerConsent();
  }

  static init(config: WebSDKConfig): ImmutableWebSDK {
    return new ImmutableWebSDK(config);
  }

  /**
   * Fetch server-side consent and reconcile with local state.
   * If the server has a consent record but the local cookie was cleared,
   * restore the server's consent level locally. Non-blocking, fire-and-forget.
   */
  private reconcileServerConsent(): void {
    this.consent.fetchServerConsent(this.anonymousId).then((serverStatus) => {
      if (!serverStatus || serverStatus === 'not_set') return;

      const local = this.consent.getLevel();
      // Server has a recorded consent but local is 'none' (cookie was cleared)
      // — restore the server's consent level
      if (local === 'none' && serverStatus !== 'none') {
        this.setConsent(serverStatus as ConsentLevel);
        this.debug?.logWarning(
          `Restored consent from server: ${serverStatus} (local cookie was cleared)`,
        );
      }
    }).catch(() => {
      // Network failure — continue with local consent
    });
  }

  // --- Page tracking ---

  page(properties?: Record<string, unknown>): void {
    if (this.consent.getLevel() === 'none') return;
    touchSession(this.cookieDomain);

    const mergedProps: Record<string, unknown> = { ...properties };

    // Attach attribution context to the first page view in the session
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
      properties: Object.keys(mergedProps).length > 0 ? mergedProps : undefined,
      userId: this.consent.getLevel() === 'full' ? this.userId : undefined,
    };

    this.queue.enqueue(message);
    this.debug?.logEvent('page', message);
  }

  // --- Event tracking ---

  /** Track a typed event with compile-time parameter validation. */
  track<E extends AudienceEvent>(event: E, properties: EventParamMap[E]): void;

  /** Track a custom event with arbitrary name and properties. */
  track(event: string, properties?: Record<string, unknown>): void;

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
      eventName: event,
      properties: properties as Record<string, unknown> | undefined,
      userId: this.consent.getLevel() === 'full' ? this.userId : undefined,
    };

    this.queue.enqueue(message);
    this.debug?.logEvent('track', message);
  }

  // --- Identity ---

  /**
   * Associate all future events with a known user identity.
   * Requires full consent — at anonymous/none this is a no-op.
   */
  identify(uid: string, provider: IdentityProvider, traits?: UserTraits): void;

  /**
   * Attach traits to the current anonymous identity (no userId).
   * For the external-ID-first scenario: a player links Steam before
   * creating an account. Requires full consent.
   */
  identify(traits: UserTraits): void;

  identify(
    uidOrTraits: string | UserTraits,
    provider?: IdentityProvider,
    traits?: UserTraits,
  ): void {
    if (this.consent.getLevel() !== 'full') {
      this.debug?.logWarning(
        'identify() requires full consent — call ignored. Set consent to "full" first.',
      );
      return;
    }
    touchSession(this.cookieDomain);

    // Overload: identify(traits) — anonymous identify, no userId
    if (typeof uidOrTraits === 'object') {
      const message: IdentifyMessage = {
        type: 'identify',
        messageId: generateId(),
        eventTimestamp: getTimestamp(),
        anonymousId: this.anonymousId,
        surface: 'web',
        context: collectContext(),
        traits: uidOrTraits as Record<string, unknown>,
      };
      this.queue.enqueue(message);
      this.debug?.logEvent('identify', message);
      return;
    }

    // Overload: identify(uid, provider, traits?) — known user
    this.userId = uidOrTraits;

    const message: IdentifyMessage = {
      type: 'identify',
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web',
      context: collectContext(),
      userId: uidOrTraits,
      identityType: provider as IdentityType,
      traits: traits as Record<string, unknown> | undefined,
    };

    this.queue.enqueue(message);
    this.debug?.logEvent('identify', message);
  }

  /**
   * Link two identities as belonging to the same player.
   *
   * Fires an AliasMessage with fromId/fromType/toId/toType per the
   * backend schema. Does not change the current userId.
   */
  alias(from: Identity, to: Identity): void {
    if (this.consent.getLevel() === 'none') return;
    if (!isAliasValid(from.uid, from.provider, to.uid, to.provider)) {
      this.debug?.logWarning('alias() from and to are identical — call ignored.');
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
      fromId: from.uid,
      fromType: from.provider as IdentityType,
      toId: to.uid,
      toType: to.provider as IdentityType,
    };

    this.queue.enqueue(message);
    this.debug?.logEvent('alias', message);
  }

  // --- Consent ---

  /**
   * Update consent level. Triggers queue purge on downgrade and
   * syncs the new status to the backend via PUT /v1/audience/tracking-consent.
   */
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
        // Remove identify messages, strip userId from remaining
        this.queue.purge((m) => m.type === 'identify');
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

    // Upgrading from none — create identity cookies and start queue
    if (previous === 'none' && level !== 'none') {
      this.anonymousId = getOrCreateAnonymousId(this.cookieDomain);
      getOrCreateSessionId(this.cookieDomain);
      this.queue.start();
    }
  }

  // --- Lifecycle ---

  /**
   * Reset identity. Clears userId and generates a new anonymousId.
   * Use on logout to prevent cross-user data contamination.
   */
  reset(): void {
    this.userId = undefined;
    this.anonymousId = getOrCreateAnonymousId(this.cookieDomain);
    getOrCreateSessionId(this.cookieDomain);
    this.isFirstPage = true;
  }

  /** Flush all queued messages immediately. */
  async flush(): Promise<void> {
    await this.queue.flush();
  }

  /** Flush remaining events and stop the SDK. */
  shutdown(): void {
    this.queue.flushUnload();
    this.queue.stop();
    this.pageTracker.teardown();
  }
}
