/* eslint-disable no-console, class-methods-use-this */
import type { Message, ConsentLevel } from '@imtbl/audience-core';

const PREFIX = '[Immutable Audience]';

export class DebugLogger {
  logEvent(method: string, message: Message): void {
    console.log(`${PREFIX} ${method}()`, message);
  }

  logFlush(ok: boolean, count: number): void {
    console.log(
      `${PREFIX} flush: ${ok ? 'success' : 'failed'}, ${count} message${count !== 1 ? 's' : ''}`,
    );
  }

  logConsent(from: ConsentLevel, to: ConsentLevel): void {
    console.log(`${PREFIX} consent: ${from} \u2192 ${to}`);
  }

  logWarning(msg: string): void {
    console.warn(`${PREFIX} ${msg}`);
  }
}
