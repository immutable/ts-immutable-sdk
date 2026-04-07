import type {
  ConsentLevel,
  Environment,
} from '@imtbl/audience-core';
import {
  CONSENT_PATH,
  getBaseUrl,
  truncateSource,
} from '@imtbl/audience-core';

/** Pluggable transport for syncing consent state to the server. */
export interface ConsentTransport {
  syncConsent(
    url: string,
    publishableKey: string,
    body: { anonymousId: string; status: ConsentLevel; source: string },
  ): Promise<void>;
}

/** Side-effect callbacks invoked by the consent state machine on transitions. */
export interface ConsentCallbacks {
  /** Called on any downgrade to 'none' — stop queue, purge all messages. */
  onPurgeQueue?: () => void;
  /** Called on full → anonymous — remove identify/alias, strip userId. */
  onStripIdentity?: () => void;
  /** Called on any downgrade to 'none' — clear persisted identity (cookies, storage). */
  onClearIdentity?: () => void;
}

/**
 * Consent state machine shared across all surface SDKs.
 *
 * Owns the three-tier consent model (none/anonymous/full) and transition
 * semantics. Platform-specific I/O (HTTP transport, cookie/storage clearing)
 * is injected via ConsentTransport and ConsentCallbacks.
 */
export class ConsentManager {
  private level: ConsentLevel;

  private readonly baseUrl: string;

  private readonly source: string;

  constructor(
    environment: Environment,
    private readonly publishableKey: string,
    initialConsent: ConsentLevel,
    rawSource: string,
    private readonly transport: ConsentTransport,
  ) {
    this.baseUrl = getBaseUrl(environment);
    this.source = truncateSource(rawSource);
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
    const previous = this.level;
    this.level = level;

    // Downgrade: any → none — purge everything + clear persisted identity
    if (level === 'none') {
      callbacks?.onPurgeQueue?.();
      callbacks?.onClearIdentity?.();
    } else if (level === 'anonymous' && previous === 'full') {
      // Downgrade: full → anonymous — strip PII, keep anonymous events
      callbacks?.onStripIdentity?.();
    }

    // Sync to server (fire-and-forget)
    this.syncToServer(anonymousId, level);
  }

  private syncToServer(anonymousId: string, status: ConsentLevel): void {
    const url = `${this.baseUrl}${CONSENT_PATH}`;
    this.transport.syncConsent(url, this.publishableKey, {
      anonymousId,
      status,
      source: this.source,
    }).catch(() => {
      // Fire-and-forget — transport implementation handles error logging
    });
  }
}
