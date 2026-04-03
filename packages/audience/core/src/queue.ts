import type { Message, BatchPayload } from './types';
import type { Transport } from './transport';
import * as storage from './storage';
import { isBrowser } from './utils';

const STORAGE_KEY = 'queue';

/**
 * Batched message queue with localStorage durability.
 *
 * Messages are flushed on a timer OR when the queue reaches `flushSize`,
 * whichever comes first. On success the sent messages are removed; on
 * failure they stay queued and retry on the next flush cycle.
 *
 * localStorage is used as a write-through cache so messages survive
 * page navigations. On construction, any previously-persisted messages
 * are restored into memory.
 *
 * When started, the queue also listens for page-unload events
 * (`visibilitychange` and `pagehide`) and flushes via `sendBeacon`
 * to ensure events are not lost when the user navigates away.
 */
export class MessageQueue {
  private messages: Message[];

  private timer: ReturnType<typeof setInterval> | null = null;

  private flushing = false;

  private readonly onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      this.flushBeacon();
    }
  };

  private readonly onPageHide = (): void => {
    this.flushBeacon();
  };

  constructor(
    private readonly transport: Transport,
    private readonly endpointUrl: string,
    private readonly publishableKey: string,
    private readonly flushIntervalMs: number,
    private readonly flushSize: number,
  ) {
    this.messages = (storage.getItem(STORAGE_KEY) as Message[] | undefined) ?? [];
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), this.flushIntervalMs);

    if (isBrowser()) {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      window.addEventListener('pagehide', this.onPageHide);
    }
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;

    if (isBrowser()) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      window.removeEventListener('pagehide', this.onPageHide);
    }
  }

  /** Stops the queue, flushes remaining messages via beacon, and removes listeners. */
  destroy(): void {
    this.stop();
    this.flushBeacon();
  }

  enqueue(message: Message): void {
    this.messages.push(message);
    this.persist();

    if (this.messages.length >= this.flushSize) {
      this.flush();
    }
  }

  /** Guard prevents concurrent flushes from racing on the same batch. */
  async flush(): Promise<void> {
    if (this.flushing || this.messages.length === 0) return;

    this.flushing = true;
    try {
      const batch = [...this.messages];
      const payload: BatchPayload = { messages: batch };

      const ok = await this.transport.send(this.endpointUrl, this.publishableKey, payload);
      if (ok) {
        // Slice rather than clear — new messages may have been enqueued during the request.
        this.messages = this.messages.slice(batch.length);
        this.persist();
      }
    } finally {
      this.flushing = false;
    }
  }

  get length(): number {
    return this.messages.length;
  }

  clear(): void {
    this.messages = [];
    storage.removeItem(STORAGE_KEY);
  }

  /**
   * Synchronous flush using sendBeacon for page-unload scenarios.
   * sendBeacon is fire-and-forget and survives page navigation.
   * Falls back to the normal async flush if sendBeacon is unavailable.
   */
  private flushBeacon(): void {
    if (this.messages.length === 0) return;

    const payload: BatchPayload = { messages: [...this.messages] };
    const body = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon(this.endpointUrl, blob);
      if (sent) {
        this.messages = [];
        this.persist();
        return;
      }
    }

    // Fallback: trigger async flush (best-effort, may not complete before unload)
    this.flush();
  }

  private persist(): void {
    storage.setItem(STORAGE_KEY, this.messages);
  }
}
