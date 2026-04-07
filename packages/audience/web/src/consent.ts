import type {
  ConsentLevel,
  Environment,
} from '@imtbl/audience-core';
import {
  CONSENT_PATH,
  COOKIE_NAME,
  SESSION_COOKIE,
  getBaseUrl,
  deleteCookie,
  truncateSource,
} from '@imtbl/audience-core';

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
      // Fire-and-forget — consent sync failure shouldn't break the SDK
    }
  }
}
