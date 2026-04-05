import type { ConsentLevel, ConsentStatus, Environment } from '@imtbl/audience-core';
import { CONSENT_PATH, getBaseUrl } from '@imtbl/audience-core';
import {
  getConsentCookie,
  setConsentCookie,
  deleteCookie,
  ANON_ID_COOKIE,
  SESSION_COOKIE,
} from './cookie';
import { isBrowser } from './utils';
import { truncateSource } from './validation';

/**
 * Check if the browser signals a Do Not Track or Global Privacy Control
 * preference. When either is active, consent should be capped at 'none'.
 */
export function detectPrivacySignal(): boolean {
  if (!isBrowser()) return false;
  const nav = navigator as any;
  // DNT: '1' means tracking opt-out
  if (nav.doNotTrack === '1' || (window as any).doNotTrack === '1') return true;
  // GPC: globalPrivacyControl is a boolean
  if (nav.globalPrivacyControl === true) return true;
  return false;
}

export interface ConsentCallbacks {
  onPurgeQueue?: () => void;
  onStripIdentity?: () => void;
  onClearCookies?: () => void;
}

export class ConsentManager {
  private level: ConsentLevel;

  private readonly baseUrl: string;

  private readonly publishableKey: string;

  private readonly source: string;

  private readonly cookieDomain?: string;

  constructor(
    environment: Environment,
    publishableKey: string,
    initialConsent: ConsentLevel,
    rawSource: string,
    cookieDomain?: string,
  ) {
    this.baseUrl = getBaseUrl(environment);
    this.publishableKey = publishableKey;
    this.source = truncateSource(rawSource);
    this.cookieDomain = cookieDomain;

    // DNT / GPC: auto-downgrade to 'none' if browser signals tracking opt-out
    if (detectPrivacySignal()) {
      this.level = 'none';
      this.persistLocal();
      return;
    }

    // Honour existing consent cookie if set (shared with pixel)
    const persisted = getConsentCookie() as ConsentLevel | undefined;
    if (persisted && ['none', 'anonymous', 'full'].includes(persisted)) {
      this.level = persisted;
    } else {
      this.level = initialConsent;
    }
    this.persistLocal();
  }

  getLevel(): ConsentLevel {
    return this.level;
  }

  setLevel(
    level: ConsentLevel,
    anonymousId: string,
    callbacks?: ConsentCallbacks,
  ): void {
    // DNT / GPC active: refuse to upgrade consent
    if (level !== 'none' && detectPrivacySignal()) return;

    const { level: previous } = this;
    this.level = level;
    this.persistLocal();

    // Downgrade: full/anonymous -> none — purge everything
    if (level === 'none') {
      callbacks?.onPurgeQueue?.();
      callbacks?.onClearCookies?.();
    } else if (level === 'anonymous' && previous === 'full') {
      // Downgrade: full -> anonymous — strip PII, keep anonymous events
      callbacks?.onStripIdentity?.();
    }

    // Sync to server (fire-and-forget)
    this.syncToServer(anonymousId, level);
  }

  /** Fetch server-side consent status for reconciliation. */
  async fetchServerConsent(anonymousId: string): Promise<ConsentStatus | undefined> {
    try {
      const url = `${this.baseUrl}${CONSENT_PATH}?anonymousId=${encodeURIComponent(anonymousId)}`;
      const res = await fetch(url, {
        headers: { 'x-immutable-publishable-key': this.publishableKey },
      });
      if (!res.ok) return undefined;
      const body = (await res.json()) as { status: ConsentStatus };
      return body.status;
    } catch {
      return undefined;
    }
  }

  clearCookies(): void {
    deleteCookie(ANON_ID_COOKIE, this.cookieDomain);
    deleteCookie(SESSION_COOKIE, this.cookieDomain);
    // Keep consent cookie — remembers the "none" choice
  }

  private persistLocal(): void {
    setConsentCookie(this.level, this.cookieDomain);
  }

  private async syncToServer(anonymousId: string, status: ConsentLevel): Promise<void> {
    try {
      await fetch(`${this.baseUrl}${CONSENT_PATH}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-immutable-publishable-key': this.publishableKey,
        },
        body: JSON.stringify({ anonymousId, status, source: this.source }),
      });
    } catch {
      // Fire-and-forget — consent sync failure shouldn't break the SDK
    }
  }
}
