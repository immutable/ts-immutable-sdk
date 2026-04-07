import type {
  ConsentLevel,
  ConsentStatus,
  Environment,
} from '@imtbl/audience-core';
import {
  CONSENT_PATH,
  COOKIE_NAME,
  SESSION_COOKIE,
  getBaseUrl,
  isBrowser,
  deleteCookie,
  truncateSource,
} from '@imtbl/audience-core';

/**
 * Check if the browser signals a Do Not Track or Global Privacy Control
 * preference. Studios can call this before deciding what to pass to setConsent().
 */
export function detectPrivacySignal(): boolean {
  if (!isBrowser()) return false;
  const nav = navigator as any;
  if (nav.doNotTrack === '1' || (window as any).doNotTrack === '1') return true;
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
    this.level = initialConsent;
  }

  getLevel(): ConsentLevel {
    return this.level;
  }

  setLevel(
    level: ConsentLevel,
    anonymousId: string,
    callbacks?: ConsentCallbacks,
  ): void {
    const { level: previous } = this;
    this.level = level;

    if (level === 'none') {
      callbacks?.onPurgeQueue?.();
      callbacks?.onClearCookies?.();
    } else if (level === 'anonymous' && previous === 'full') {
      callbacks?.onStripIdentity?.();
    }

    this.syncToServer(anonymousId, level);
  }

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
    deleteCookie(COOKIE_NAME, this.cookieDomain);
    deleteCookie(SESSION_COOKIE, this.cookieDomain);
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
      // Fire-and-forget
    }
  }
}
