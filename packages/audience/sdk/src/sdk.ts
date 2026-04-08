import type {
  Attribution,
  ConsentLevel,
  ConsentManager,
  Message,
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
  collectContext,
  collectAttribution,
  getOrCreateSession,
  createConsentManager,
} from '@imtbl/audience-core';
import { DebugLogger } from './debug';
import type { AudienceConfig } from './types';
import {
  LIBRARY_NAME, LIBRARY_VERSION, LOG_PREFIX, DEFAULT_CONSENT_SOURCE, SESSION_START, SESSION_END,
} from './config';

/**
 * Track player activity on your website — page views, purchases, sign-ups —
 * and tie it to player identity when they log in.
 *
 * Create via `Audience.init()`. Call `shutdown()` when done.
 */
export class Audience {
  private static liveInstances = 0;

  private readonly queue: MessageQueue;

  private readonly consent: ConsentManager;

  private readonly attribution: Attribution;

  private readonly debug: DebugLogger;

  private readonly cookieDomain?: string;

  private anonymousId: string;

  private sessionId: string | undefined;

  private sessionStartTime: number | undefined;

  private userId: string | undefined;

  private isFirstPage = true;

  private constructor(config: AudienceConfig) {
    const {
      cookieDomain,
      environment,
      publishableKey,
    } = config;
    const consentLevel = config.consent ?? 'none';
    const consentSource = DEFAULT_CONSENT_SOURCE;
    const flushInterval = config.flushInterval ?? FLUSH_INTERVAL_MS;
    const flushSize = config.flushSize ?? FLUSH_SIZE;

    this.cookieDomain = cookieDomain;
    this.debug = new DebugLogger(config.debug ?? false);

    let isNewSession = false;
    if (consentLevel !== 'none') {
      this.anonymousId = getOrCreateAnonymousId(cookieDomain);
      isNewSession = this.startSession();
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
        onFlush: (ok, count) => this.debug.logFlush(ok, count),
        staleFilter: (m) => isTimestampValid(m.eventTimestamp),
        storagePrefix: '__imtbl_web_',
      },
    );

    this.consent = createConsentManager(
      this.queue,
      publishableKey,
      this.anonymousId,
      environment,
      consentSource,
      consentLevel,
    );

    this.attribution = collectAttribution();

    if (!this.isTrackingDisabled()) {
      this.queue.start();
      if (isNewSession) this.trackSessionStart();
    }
  }

  /**
   * Create and start the SDK. Warns if another instance is already active —
   * call `shutdown()` on the previous one first.
   */
  static init(config: AudienceConfig): Audience {
    if (!config.publishableKey?.trim()) {
      throw new Error(`${LOG_PREFIX} publishableKey is required`);
    }
    if (Audience.liveInstances > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `${LOG_PREFIX} Multiple SDK instances detected.`
        + ' Ensure previous instances are shut down to avoid duplicate events.',
      );
    }
    Audience.liveInstances += 1;
    return new Audience(config);
  }

  // --- Helpers ---

  /** True when consent is 'none' — SDK should not enqueue anything. */
  private isTrackingDisabled(): boolean {
    return this.consent.level === 'none';
  }

  /** Returns userId if consent is full, undefined otherwise. */
  private effectiveUserId(): string | undefined {
    return this.consent.level === 'full' ? this.userId : undefined;
  }

  /** Create or resume a session, returning whether it's new. */
  private startSession(): boolean {
    const session = getOrCreateSession(this.cookieDomain);
    this.sessionId = session.sessionId;
    this.sessionStartTime = Date.now();
    return session.isNew;
  }

  // --- Message factory ---

  /** Common fields shared by every message. */
  private baseMessage() {
    return {
      messageId: generateId(),
      eventTimestamp: getTimestamp(),
      anonymousId: this.anonymousId,
      surface: 'web' as const,
      context: collectContext(LIBRARY_NAME, LIBRARY_VERSION),
    };
  }

  private enqueue(label: string, message: Message): void {
    this.queue.enqueue(message);
    this.debug.logEvent(label, message);
  }

  // --- Session lifecycle ---

  private trackSessionStart(): void {
    if (!this.sessionId) return;
    this.enqueue('track(session_start)', {
      ...this.baseMessage(),
      type: 'track',
      eventName: SESSION_START,
      properties: {
        sessionId: this.sessionId,
        ...this.attribution,
      },
    });
  }

  private trackSessionEnd(): void {
    if (!this.sessionId) return;
    this.enqueue('track(session_end)', {
      ...this.baseMessage(),
      type: 'track',
      eventName: SESSION_END,
      properties: {
        sessionId: this.sessionId,
        ...(this.sessionStartTime && {
          duration: Math.round((Date.now() - this.sessionStartTime) / 1000),
        }),
      },
    });
  }

  // --- Page tracking ---

  /**
   * Record a page view. Call this on every route change in your app.
   * The first call automatically captures how the player arrived
   * (UTM params, ad click IDs, referrer). No-op when consent is 'none'.
   */
  page(properties?: Record<string, unknown>): void {
    if (this.isTrackingDisabled()) return;
    getOrCreateSession(this.cookieDomain);

    const mergedProps: Record<string, unknown> = { ...properties };
    if (this.isFirstPage) {
      Object.assign(mergedProps, this.attribution);
      this.isFirstPage = false;
    }

    this.enqueue('page', {
      ...this.baseMessage(),
      type: 'page',
      properties: Object.keys(mergedProps).length > 0 ? mergedProps : undefined,
      userId: this.effectiveUserId(),
    });
  }

  // --- Event tracking ---

  /**
   * Record a player action like a purchase, sign-up, or game launch.
   * Pass the event name and any properties you want to analyse later.
   * No-op when consent is 'none'.
   */
  track(event: string, properties?: Record<string, unknown>): void {
    if (this.isTrackingDisabled()) return;
    getOrCreateSession(this.cookieDomain);

    this.enqueue('track', {
      ...this.baseMessage(),
      type: 'track',
      eventName: truncate(event),
      properties,
      userId: this.effectiveUserId(),
    });
  }

  // --- Identity ---

  /**
   * Tell the SDK who this player is. Call when a player logs in or links
   * an account. Before identify(), the SDK only knows an anonymous cookie ID.
   * After, all future events are tied to this player.
   *
   * Named: `sdk.identify('user@example.com', 'email', { name: 'Jane' })`
   * Traits only: `sdk.identify({ source: 'steam', steamId: '765...' })`
   *
   * Requires 'full' consent.
   */
  identify(uid: string, provider: string, traits?: UserTraits): void;

  identify(traits: UserTraits): void;

  identify(
    uidOrTraits: string | UserTraits,
    provider?: string,
    traits?: UserTraits,
  ): void {
    if (this.consent.level !== 'full') {
      this.debug.logWarning('identify() requires full consent — call ignored.');
      return;
    }
    getOrCreateSession(this.cookieDomain);

    if (uidOrTraits !== null && typeof uidOrTraits === 'object' && !Array.isArray(uidOrTraits)) {
      this.enqueue('identify', {
        ...this.baseMessage(),
        type: 'identify',
        traits: uidOrTraits,
      });
      return;
    }

    if (typeof uidOrTraits !== 'string') return;

    const uid = truncate(uidOrTraits);
    this.userId = uid;
    this.enqueue('identify', {
      ...this.baseMessage(),
      type: 'identify',
      userId: uid,
      identityType: provider,
      traits,
    });
  }

  /**
   * Connect two accounts that belong to the same player. Use when a player
   * previously known by one identity (e.g. Steam ID) creates or links a
   * different account (e.g. Passport email). This tells the backend they're
   * the same person so analytics aren't split across two profiles.
   *
   * Requires 'full' consent. `from` and `to` must differ.
   */
  alias(
    from: { uid: string; provider: string },
    to: { uid: string; provider: string },
  ): void {
    if (this.consent.level !== 'full') {
      this.debug.logWarning('alias() requires full consent — call ignored.');
      return;
    }
    if (!isAliasValid(from.uid, from.provider, to.uid, to.provider)) {
      this.debug.logWarning('alias() from and to are identical — call ignored.');
      return;
    }
    getOrCreateSession(this.cookieDomain);

    this.enqueue('alias', {
      ...this.baseMessage(),
      type: 'alias',
      fromId: truncate(from.uid),
      fromType: from.provider,
      toId: truncate(to.uid),
      toType: to.provider,
    });
  }

  // --- Consent ---

  /**
   * Update tracking consent, typically in response to a cookie banner.
   * Call whenever your consent management platform reports a change.
   *
   * - 'none': all tracking stops, cookies are cleared.
   * - 'anonymous': track activity without knowing who the player is.
   * - 'full': track everything including player identity.
   */
  setConsent(level: ConsentLevel): void {
    const previous = this.consent.level;
    if (level === previous) return;

    this.debug.logConsent(previous, level);

    const isUpgradeFromNone = previous === 'none' && level !== 'none';

    // When upgrading from none, create the persisted anonymousId first
    // so the consent sync sends the correct ID to the server.
    if (isUpgradeFromNone) {
      this.anonymousId = getOrCreateAnonymousId(this.cookieDomain);
    }

    // Web-specific cleanup before core handles queue purge/transform and server sync.
    // session_end is intentionally not emitted — no events should be sent after opt-out.
    if (level === 'none') {
      this.queue.stop();
    }

    // Core handles: queue purge on →none, userId strip on →anonymous, server sync.
    this.consent.setLevel(level);

    // Web-specific cleanup after core's transition.
    if (level === 'none') {
      deleteCookie(COOKIE_NAME, this.cookieDomain);
      deleteCookie(SESSION_COOKIE, this.cookieDomain);
    } else if (level === 'anonymous' && previous === 'full') {
      this.userId = undefined;
      this.queue.purge(
        (m) => m.type === 'identify' || m.type === 'alias',
      );
    }

    if (isUpgradeFromNone) {
      this.isFirstPage = true;
      const isNewSession = this.startSession();
      this.queue.start();
      if (isNewSession) this.trackSessionStart();
    }
  }

  // --- Lifecycle ---

  /**
   * Call on player logout. Generates a fresh anonymous ID so the next
   * player on this device isn't confused with the previous one. Queued
   * events from the previous session are discarded.
   */
  reset(): void {
    this.userId = undefined;
    this.queue.clear();
    deleteCookie(COOKIE_NAME, this.cookieDomain);
    deleteCookie(SESSION_COOKIE, this.cookieDomain);
    if (!this.isTrackingDisabled()) {
      this.anonymousId = getOrCreateAnonymousId(this.cookieDomain);
      const isNewSession = this.startSession();
      if (isNewSession) this.trackSessionStart();
    } else {
      this.anonymousId = generateId();
      this.sessionId = undefined;
      this.sessionStartTime = undefined;
    }
    this.isFirstPage = true;
  }

  /**
   * Send all queued events now instead of waiting for the next automatic
   * flush. Useful before navigating away from a critical page.
   */
  async flush(): Promise<void> {
    await this.queue.flush();
  }

  /**
   * Stop the SDK and send any remaining events. Call when your app
   * unmounts or the player leaves.
   */
  shutdown(): void {
    if (!this.isTrackingDisabled()) this.trackSessionEnd();
    this.queue.destroy();
    Audience.liveInstances = Math.max(0, Audience.liveInstances - 1);
  }
}
