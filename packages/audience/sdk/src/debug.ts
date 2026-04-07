import type { ConsentLevel, Message } from '@imtbl/audience-core';

export const LOG_PREFIX = '[audience-sdk]';

export class DebugLogger {
  private enabled: boolean;

  constructor(enabled = false) {
    this.enabled = enabled;
  }

  logEvent(method: string, message: Message): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} ${method}`, message);
  }

  logFlush(ok: boolean, count: number): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} flush ${ok ? 'ok' : 'failed'} (${count} messages)`);
  }

  logConsent(from: ConsentLevel, to: ConsentLevel): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log(`${LOG_PREFIX} consent ${from} → ${to}`);
  }

  logWarning(msg: string): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.warn(`${LOG_PREFIX} ${msg}`);
  }
}
