import type {
  Attribution,
  AttributionNetwork,
  ConsentLevel,
  ConsentManager,
  Message,
  UserTraits,
} from '@imtbl/audience-core';
import {
  COOKIE_NAME,
  SESSION_COOKIE,
  MessageQueue,
  httpSend,
  getOrCreateAnonymousId,
  getCookie,
  deleteCookie,
  generateId,
  getTimestamp,
  IdentityType,
  isAliasValid,
  isTimestampValid,
  isPassportIdValid,
  isValidConsentLevel,
  isValidIdentityType,
  hasValue,
  truncate,
  collectContext,
  collectSessionAttribution,
  collectThirdPartyIds,
  getAttributionNetwork as resolveAttributionNetwork,
  getOrCreateSessionId,
  createConsentManager,
  canTrack,
  canIdentify,
  detectDoNotTrack,
  isBrowser,
  setupAutocapture,
} from '@imtbl/audience-core';
import { adoptAnonymousId } from '@imtbl/audience-core/internal';
import { track } from '@imtbl/metrics';
import { DebugLogger } from './debug';
import { REQUIRED_EVENT_PROPS, type AudienceEventName, type PropsFor } from './events';
import {
  CONVERSION_ID_PROPERTY,
  CONVERSION_NETWORK_PROPERTY,
  DEDUP_CAPABLE_NETWORKS,
  type ConversionResult,
} from './conversion';
import type { AudienceConfig } from './types';
import {
  LIBRARY_NAME, LIBRARY_VERSION, LOG_PREFIX, DEFAULT_CONSENT_SOURCE,
} from './config';

/** Track events that carry UTM attribution from the current page URL. */
const UTM_EVENTS: ReadonlySet<string> = new Set([
  'sign_up', 'link_clicked',
]);

// Thrown so a caller bug can't be missed the way a console warning can be.
function invalidCall(message: string): never {
  throw new Error(`${LOG_PREFIX} ${message}`);
}

// The sample app string-matches "doesn't look like a Passport ID" to detect
// this failure — keep that phrase if this wording changes.
function invalidPassportId(method: string, typeLabel: string, idLabel: string, id: string): never {
  invalidCall(
    `${method} called with ${typeLabel} 'passport' but ${idLabel} "${id}" doesn't look `
    + 'like a Passport ID (expected a format like "email|123" or a UUID). Check you\'re passing '
    + 'the Passport user ID, not your own internal user ID.',
  );
}

// TypeScript enforces this shape at the call site, but only for callers who
// go through the compiler; this closes the gap for anyone else (raw JS, an
// `any` cast, a dynamically-built properties object).
function validateRequiredProps(event: string, properties: Record<string, unknown> | undefined): void {
  const required = REQUIRED_EVENT_PROPS[event as AudienceEventName];
  if (!required) return;
  const missing = required.filter((key) => properties?.[key] === undefined);
  if (missing.length > 0) {
    const plural = missing.length > 1 ? 'ies' : 'y';
    invalidCall(`track('${event}', ...) is missing required propert${plural}: ${missing.join(', ')}.`);
  }
}

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

  private readonly publishableKey: string;

  private readonly baseUrl: string | undefined;

  private readonly onError: AudienceConfig['onError'];

  private readonly testMode: boolean;

  private anonymousId: string;

  private sessionId: string | undefined;

  private userId: string | undefined;

  private identityType: IdentityType | undefined;

  private isFirstPage = true;

  private destroyed = false;

  private teardownAutocapture?: () => void;

  private resetScrollDepth?: () => void;

  private static readonly UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private static readAndStripAidParam(): string | null {
    if (!isBrowser()) return null;
    const params = new URLSearchParams(window.location.search);
    const aid = params.get('imtbl_aid');
    if (aid !== null) {
      params.delete('imtbl_aid');
      const search = params.toString();
      const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
      window.history.replaceState(window.history.state, '', newUrl);
    }
    return aid && Audience.UUID_RE.test(aid) ? aid : null;
  }

  private constructor(config: AudienceConfig) {
    const {
      cookieDomain,
      publishableKey,
    } = config;
    const consentLevel = config.consent ?? 'none';
    const consentSource = DEFAULT_CONSENT_SOURCE;

    this.cookieDomain = cookieDomain;
    this.publishableKey = publishableKey;
    this.baseUrl = config.baseUrl;
    this.onError = config.onError;
    this.testMode = config.testMode ?? false;
    this.debug = new DebugLogger(config.debug ?? false);

    if (detectDoNotTrack() && consentLevel !== 'none') {
      this.debug.logWarning('GPC or DNT signal active: consent overridden to none.');
    }

    const incomingAid = Audience.readAndStripAidParam();

    if (canTrack(consentLevel)) {
      if (incomingAid) {
        adoptAnonymousId(incomingAid, cookieDomain);
        this.anonymousId = incomingAid;
      } else {
        this.anonymousId = getOrCreateAnonymousId(cookieDomain);
      }
      this.refreshSession();
    } else {
      this.anonymousId = getCookie(COOKIE_NAME) ?? generateId();
    }

    this.queue = new MessageQueue(
      httpSend,
      publishableKey,
      {
        baseUrl: config.baseUrl,
        flushIntervalMs: config.flushInterval,
        flushSize: config.flushSize,
        onFlush: (ok, count) => this.debug.logFlush(ok, count),
        onError: config.onError,
        staleFilter: (m) => isTimestampValid(m.eventTimestamp),
        storagePrefix: '__imtbl_web_',
        logPrefix: LOG_PREFIX,
      },
    );

    this.consent = createConsentManager(
      httpSend,
      publishableKey,
      this.anonymousId,
      consentSource,
      consentLevel,
      config.onError,
      config.baseUrl,
    );

    this.attribution = collectSessionAttribution();

    if (!this.isTrackingDisabled()) this.queue.start();

    // Consent is checked at fire time by each handler, not here.
    const autocaptureResult = setupAutocapture(
      config.autocapture ?? {},
      (eventName, properties) => this.track(eventName, properties),
      () => this.consent.level,
    );
    this.teardownAutocapture = autocaptureResult.teardown;
    this.resetScrollDepth = autocaptureResult.resetScroll;
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

  /** Returns the anonymous ID for the current browser session. */
  getAnonymousId(): string {
    return this.anonymousId;
  }

  /**
   * The ad network this visit is attributed to, classified from the
   * session-cached first-touch attribution captured when the SDK initialised
   * (UTM params + ad-network click IDs). Returns `'organic'` when there's no
   * paid signal, or `'other'` for a recognised but unnamed click ID. Stable
   * for the session, so it agrees with server-side attribution even after the
   * landing URL's query params are gone.
   */
  getAttributionNetwork(): AttributionNetwork {
    return resolveAttributionNetwork(this.attribution);
  }

  /** True when the current consent level does not permit tracking. */
  private isTrackingDisabled(): boolean {
    return !canTrack(this.consent.level);
  }

  /** Returns userId if consent is full, undefined otherwise. */
  private effectiveUserId(): string | undefined {
    return canIdentify(this.consent.level) ? this.userId : undefined;
  }

  /** Returns identityType if consent is full, undefined otherwise. */
  private effectiveIdentityType(): IdentityType | undefined {
    return canIdentify(this.consent.level) ? this.identityType : undefined;
  }

  /** Create or resume the rolling session and cache its ID. */
  private refreshSession(): void {
    this.sessionId = getOrCreateSessionId(this.cookieDomain);
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
      consentLevel: this.consent.level,
      sessionId: this.sessionId,
      ...(this.testMode && { test: true as const }),
    };
  }

  private enqueue(label: string, message: Message): void {
    this.queue.enqueue(message);
    this.debug.logEvent(label, message);
  }

  // --- Page tracking ---

  /**
   * Record a page view. Call this on every route change in your app.
   * The first call captures how the player arrived (UTM params, ad click
   * IDs, referrer). Every call includes the session ID.
   * No-op when consent is 'none'.
   */
  page(properties?: Record<string, unknown>): void {
    if (this.isTrackingDisabled()) return;
    this.refreshSession();
    this.resetScrollDepth?.();

    // Matches pixel's precedence: attribution, then third-party IDs, then the
    // caller's own properties (caller-supplied values always win on collision).
    const mergedProps: Record<string, unknown> = {};
    if (this.isFirstPage) {
      Object.assign(mergedProps, this.attribution);
      this.isFirstPage = false;
    }
    Object.assign(mergedProps, collectThirdPartyIds());
    Object.assign(mergedProps, properties);

    this.enqueue('page', {
      ...this.baseMessage(),
      type: 'page',
      properties: mergedProps,
      userId: this.effectiveUserId(),
      identityType: this.effectiveIdentityType(),
    });
  }

  // --- Event tracking ---

  /**
   * Record a player action like a purchase, sign-up, or game launch.
   * Pass the event name and any properties you want to analyse later.
   * For the predefined event names (`sign_up`, `purchase`, etc.),
   * TypeScript enforces the property shape at the call site.
   *
   * `sign_up` and `link_clicked` events automatically include the UTM
   * attribution captured at session start. All events include `sessionId`.
   *
   * No-op when consent is 'none'. Throws if the event name is empty, or if a
   * reserved event with required properties (`wishlist_add`,
   * `wishlist_remove`, `purchase`, `progression`, `resource`,
   * `game_page_viewed`, `link_clicked`, `achievement_unlocked`) is missing
   * one of them.
   */
  track<E extends AudienceEventName | string & {}>(
    event: E,
    ...args: {} extends PropsFor<E>
      ? [properties?: PropsFor<E>]
      : [properties: PropsFor<E>]
  ): void {
    this.emitTrack(event, args[0] as Record<string, unknown> | undefined);
  }

  /**
   * Like {@link track}, but mints a shared id for ad-network deduplication.
   * Use for conversion events reported to ad networks, e.g. `sign_up` or
   * `purchase`.
   *
   * Classifies the visit's network from the session-cached first-touch
   * attribution (the same signals that drive server-side attribution). For a
   * network that can dedupe on a shared id (Meta, TikTok, Reddit, X, Google),
   * it mints a conversion event id, stamps it onto the event under the reserved
   * `_imtbl_conversion_id` / `_imtbl_conversion_network` properties, and returns
   * it. Pass the returned `eventId` to that network's browser pixel (e.g. Meta
   * `fbq('track', 'CompleteRegistration', {}, { eventID })`) so it deduplicates
   * against the server-side event.
   *
   * `eventId` is null (and no dedup id is emitted) for a non-dedup-capable or
   * organic visit, or when consent doesn't permit tracking; `network` is always
   * returned for the caller's own routing. Same validation as {@link track}.
   */
  trackConversion<E extends AudienceEventName | string & {}>(
    event: E,
    ...args: {} extends PropsFor<E>
      ? [properties?: PropsFor<E>]
      : [properties: PropsFor<E>]
  ): ConversionResult {
    const network = this.getAttributionNetwork();

    if (this.isTrackingDisabled()) return { eventId: null, network };

    const eventId = DEDUP_CAPABLE_NETWORKS.has(network) ? generateId() : null;
    const conversionProps = eventId
      ? {
        [CONVERSION_ID_PROPERTY]: eventId,
        [CONVERSION_NETWORK_PROPERTY]: network,
      }
      : undefined;

    this.emitTrack(event, args[0] as Record<string, unknown> | undefined, conversionProps);

    return { eventId, network };
  }

  /**
   * Shared implementation for {@link track} and {@link trackConversion}.
   * `reserved` are SDK-owned properties (e.g. conversion ids) that take
   * precedence over caller-supplied properties on collision.
   */
  private emitTrack(
    event: string,
    properties: Record<string, unknown> | undefined,
    reserved?: Record<string, unknown>,
  ): void {
    if (this.isTrackingDisabled()) return;
    if (!hasValue(event)) invalidCall('track() called with an empty event name.');

    validateRequiredProps(event, properties);

    this.refreshSession();

    const mergedProps: Record<string, unknown> = {
      ...(UTM_EVENTS.has(event) ? this.attribution : {}),
      ...properties,
      ...reserved,
    };

    this.enqueue('track', {
      ...this.baseMessage(),
      type: 'track',
      eventName: truncate(event),
      properties: mergedProps,
      userId: this.effectiveUserId(),
      identityType: this.effectiveIdentityType(),
    });
  }

  // --- Identity ---

  /**
   * Tell the SDK who this player is. Call when a player logs in or links
   * an account. Before identify(), the SDK only knows an anonymous cookie ID.
   * After, all future events are tied to this player.
   *
   * `sdk.identify('user@example.com', 'email', { name: 'Jane' })`
   *
   * Requires 'full' consent. When `identityType` is `'passport'`, the id must
   * look like a real Passport id (`connection|id` or a UUID) — otherwise this
   * throws.
   */
  identify(id: string, identityType: IdentityType, traits?: UserTraits): void {
    if (!canIdentify(this.consent.level)) {
      this.debug.logWarning('identify() requires full consent — call ignored.');
      return;
    }
    if (!hasValue(id)) invalidCall('identify() called with an empty id.');
    if (!isValidIdentityType(identityType)) {
      invalidCall(`identify() called with unrecognised identityType "${identityType}".`);
    }
    if (identityType === IdentityType.Passport && !isPassportIdValid(id)) {
      invalidPassportId('identify()', 'identityType', 'id', id);
    }
    this.refreshSession();

    const resolvedId = truncate(id.trim());
    this.userId = resolvedId;
    this.identityType = identityType;
    this.enqueue('identify', {
      ...this.baseMessage(),
      type: 'identify',
      userId: resolvedId,
      identityType,
      traits,
    });
  }

  /**
   * Connect two accounts that belong to the same player. Use when a player
   * previously known by one identity (e.g. Steam ID) creates or links a
   * different account (e.g. Passport email). This tells the backend they're
   * the same person so analytics aren't split across two profiles.
   *
   * Requires 'full' consent. `from` and `to` must differ. When either side's
   * `identityType` is `'passport'`, that side's id must look like a real
   * Passport id (`connection|id` or a UUID) — otherwise this throws.
   */
  alias(
    from: { id: string; identityType: IdentityType },
    to: { id: string; identityType: IdentityType },
  ): void {
    if (!canIdentify(this.consent.level)) {
      this.debug.logWarning('alias() requires full consent — call ignored.');
      return;
    }
    if (!hasValue(from.id) || !hasValue(to.id)) {
      invalidCall('alias() called with an empty from.id or to.id.');
    }
    if (!isValidIdentityType(from.identityType) || !isValidIdentityType(to.identityType)) {
      invalidCall(
        `alias() called with an unrecognised identityType ("${from.identityType}"/"${to.identityType}").`,
      );
    }
    if (!isAliasValid(from.id, to.id)) {
      invalidCall('alias() from and to are identical.');
    }
    if (from.identityType === IdentityType.Passport && !isPassportIdValid(from.id)) {
      invalidPassportId('alias()', 'from.identityType', 'from.id', from.id);
    }
    if (to.identityType === IdentityType.Passport && !isPassportIdValid(to.id)) {
      invalidPassportId('alias()', 'to.identityType', 'to.id', to.id);
    }
    this.refreshSession();

    this.enqueue('alias', {
      ...this.baseMessage(),
      type: 'alias',
      fromId: truncate(from.id.trim()),
      fromType: from.identityType,
      toId: truncate(to.id.trim()),
      toType: to.identityType,
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
   *
   * Throws if `level` isn't one of the above.
   */
  setConsent(level: ConsentLevel): void {
    if (!isValidConsentLevel(level)) {
      invalidCall(`setConsent() called with unrecognised level "${level}".`);
    }
    const privacySignalActive = detectDoNotTrack();
    const effective: ConsentLevel = privacySignalActive ? 'none' : level;

    if (privacySignalActive && effective !== level) {
      track('audience', 'gpc_consent_overridden');
      this.debug.logWarning('GPC or DNT signal active: consent upgrade blocked.');
    }

    const previous = this.consent.level;
    if (effective === previous) return;

    this.debug.logConsent(previous, effective);

    const isUpgradeFromNone = !canTrack(previous) && canTrack(effective);

    if (isUpgradeFromNone) {
      this.anonymousId = getOrCreateAnonymousId(this.cookieDomain);
    }

    if (!canTrack(effective)) {
      this.queue.stop();
    }

    this.consent.setLevel(effective);

    if (!canTrack(effective)) {
      deleteCookie(COOKIE_NAME, this.cookieDomain);
      deleteCookie(SESSION_COOKIE, this.cookieDomain);
    }
    if (!canIdentify(effective)) {
      // Cleared on any downgrade out of full (not just to anonymous) so a
      // later upgrade back to full can't resurface a stale identity without
      // a fresh identify() call.
      this.userId = undefined;
      this.identityType = undefined;
    }

    if (isUpgradeFromNone) {
      this.isFirstPage = true;
      this.refreshSession();
      this.queue.start();
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
    this.identityType = undefined;
    this.queue.clear();
    deleteCookie(COOKIE_NAME, this.cookieDomain);
    deleteCookie(SESSION_COOKIE, this.cookieDomain);
    if (!this.isTrackingDisabled()) {
      this.anonymousId = getOrCreateAnonymousId(this.cookieDomain);
      this.refreshSession();
    } else {
      this.anonymousId = generateId();
      this.sessionId = undefined;
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
    if (this.destroyed) return;
    this.destroyed = true;
    this.teardownAutocapture?.();
    this.queue.destroy();
    Audience.liveInstances = Math.max(0, Audience.liveInstances - 1);
  }
}
