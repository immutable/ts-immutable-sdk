import type { Message, BatchPayload } from './types';
import type { HttpSend } from './transport';
import * as storage from './storage';
import { isBrowser } from './utils';

const STORAGE_KEY = 'queue';
const MAX_BATCH_SIZE = 100; // Backend maxItems limit per OAS

export interface MessageQueueOptions {
  onFlush?: (ok: boolean, count: number) => void;
  staleFilter?: (msg: Message) => boolean;
  /**
   * Override the localStorage key prefix (default: '__imtbl_audience_').
   * Use when multiple SDK surfaces run on the same page to prevent
   * queue collision — e.g. web SDK uses '__imtbl_web_' so its queued
   * messages don't interfere with the shared SDK's queue.
   */
  storagePrefix?: string;
}

/**
 * Batched message queue with localStorage durability.
 *
 * Messages are flushed on a timer OR when the queue reaches `flushSize`,
 * whichever comes first. On success the sent messages are removed; on
 * failure they stay queued and retry on the next flush cycle.
 *
 * localStorage is used as a write-through cache so messages survive
 * page navigations. On construction, any previously-persisted messages
 * are restored into memory (optionally filtered by `staleFilter`).
 *
 * When started, the queue listens for page-unload events
 * (`visibilitychange` and `pagehide`) and flushes via `fetch` with
 * `keepalive: true` to ensure events are not lost when the user
 * navigates away. sendBeacon is NOT used because the backend requires
 * the `x-immutable-publishable-key` header which sendBeacon cannot set.
 */
export class MessageQueue {
  private messages: Message[];

  private timer: ReturnType<typeof setInterval> | null = null;

  private flushing = false;

  private unloadBound = false;

  private visibilityHandler?: () => void;

  private pagehideHandler?: () => void;

  private readonly onFlush?: (ok: boolean, count: number) => void;

  private readonly storagePrefix?: string;

  constructor(
    private readonly send: HttpSend,
    private readonly endpointUrl: string,
    private readonly publishableKey: string,
    private readonly flushIntervalMs: number,
    private readonly flushSize: number,
    options?: MessageQueueOptions,
  ) {
    this.onFlush = options?.onFlush;
    this.storagePrefix = options?.storagePrefix;

    const restored = (storage.getItem(STORAGE_KEY, this.storagePrefix) as Message[] | undefined) ?? [];
    this.messages = options?.staleFilter
      ? restored.filter(options.staleFilter)
      : restored;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
    this.registerUnload();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.removeUnload();
  }

  /** Stops the queue, flushes remaining messages via keepalive fetch, and removes listeners. */
  destroy(): void {
    this.stop();
    this.flushUnload();
  }

  enqueue(message: Message): void {
    this.messages.push(message);
    this.persist();

    if (this.messages.length >= this.flushSize) {
      this.flush();
    }
  }

  /**
   * Send queued messages to the backend and wait for the response.
   * On success, sent messages are removed from the queue. On failure,
   * messages stay queued and retry on the next flush cycle.
   * Use this for normal operation. For page-unload scenarios, use
   * flushUnload() instead — it's fire-and-forget and survives navigation.
   */
  async flush(): Promise<void> {
    if (this.flushing || this.messages.length === 0) return;

    this.flushing = true;
    try {
      const batch = this.messages.slice(0, MAX_BATCH_SIZE);
      const payload: BatchPayload = { messages: batch };

      const result = await this.send(this.endpointUrl, this.publishableKey, payload);
      if (result.ok) {
        this.messages = this.messages.slice(batch.length);
        this.persist();
      }
      this.onFlush?.(result.ok, batch.length);
    } finally {
      this.flushing = false;
    }
  }

  /**
   * Fire-and-forget flush for page-unload scenarios.
   *
   * Uses `fetch` with `keepalive: true` so the request survives page
   * navigation. Unlike `flush()`, this is synchronous and does not wait
   * for the response — use it only in `visibilitychange`/`pagehide`
   * handlers or in `shutdown()`.
   */
  flushUnload(): void {
    if (this.flushing || this.messages.length === 0) return;

    const batch = this.messages.slice(0, MAX_BATCH_SIZE);
    const payload: BatchPayload = { messages: batch };

    // Fire-and-forget — `keepalive: true` lets the request survive page
    // navigation. We optimistically drop the batch because the page is
    // going away and can't retry. The HttpSend contract guarantees this
    // promise never rejects, so the floating call is safe.
    this.send(this.endpointUrl, this.publishableKey, payload, { keepalive: true });
    this.messages = this.messages.slice(batch.length);
    this.persist();
  }

  /** Remove all messages matching a predicate. */
  purge(predicate: (msg: Message) => boolean): void {
    this.messages = this.messages.filter((m) => !predicate(m));
    this.persist();
  }

  /** Transform messages in place (e.g., strip userId on consent downgrade). */
  transform(fn: (msg: Message) => Message): void {
    this.messages = this.messages.map(fn);
    this.persist();
  }

  get length(): number {
    return this.messages.length;
  }

  clear(): void {
    this.messages = [];
    storage.removeItem(STORAGE_KEY, this.storagePrefix);
  }

  private registerUnload(): void {
    if (!isBrowser() || this.unloadBound) return;
    this.unloadBound = true;

    this.pagehideHandler = () => this.flushUnload();
    this.visibilityHandler = () => {
      if (document.visibilityState === 'hidden') this.flushUnload();
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('pagehide', this.pagehideHandler);
  }

  private removeUnload(): void {
    if (!this.unloadBound) return;
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    if (this.pagehideHandler) {
      window.removeEventListener('pagehide', this.pagehideHandler);
    }
    this.unloadBound = false;
  }

  private persist(): void {
    storage.setItem(STORAGE_KEY, this.messages, this.storagePrefix);
  }
}
