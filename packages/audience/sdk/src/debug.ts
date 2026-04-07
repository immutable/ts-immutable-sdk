import type { ConsentLevel, Message } from '@imtbl/audience-core';

const PREFIX = '[Immutable Audience]';

export class DebugLogger {
  private enabled: boolean;

  constructor(enabled = false) {
    this.enabled = enabled;
  }

  logEvent(method: string, message: Message): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log(`${PREFIX} ${method}`, message);
  }

  logFlush(ok: boolean, count: number): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log(`${PREFIX} flush ${ok ? 'ok' : 'failed'} (${count} messages)`);
  }

  logConsent(from: ConsentLevel, to: ConsentLevel): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log(`${PREFIX} consent ${from} → ${to}`);
  }

  logWarning(msg: string): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.warn(`${PREFIX} ${msg}`);
  }
}
