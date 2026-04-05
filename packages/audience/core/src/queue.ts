import type { Message, BatchPayload } from './types';
import type { Transport } from './transport';
import * as storage from './storage';
import { isBrowser } from './utils';

const STORAGE_KEY = 'queue';
const MAX_BATCH_SIZE = 100; // Backend maxItems limit per OAS

export interface MessageQueueOptions {
  onFlush?: (ok: boolean, count: number) => void;
  staleFilter?: (msg: Message) => boolean;
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
    private readonly transport: Transport,
    private readonly endpointUrl: string,
    private readonly publishableKey: string,
    private readonly flushIntervalMs: number,
    private readonly flushSize: number,
    options?: MessageQueueOptions,
  ) {
    this.onFlush = options?.onFlush;
    this.storagePrefix = options?.storagePrefix;

    const restored = (this.storageGet() as Message[] | undefined) ?? [];
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

  /** Guard prevents concurrent flushes from racing on the same batch. */
  async flush(): Promise<void> {
    if (this.flushing || this.messages.length === 0) return;

    this.flushing = true;
    try {
      const batch = this.messages.slice(0, MAX_BATCH_SIZE);
      const payload: BatchPayload = { messages: batch };

      const ok = await this.transport.send(this.endpointUrl, this.publishableKey, payload);
      if (ok) {
        this.messages = this.messages.slice(batch.length);
        this.persist();
      }
      this.onFlush?.(ok, batch.length);
    } finally {
      this.flushing = false;
    }
  }

  /**
   * Synchronous flush for page-unload scenarios using fetch with keepalive.
   * keepalive lets the request survive page navigation (like sendBeacon)
   * while still supporting custom headers for authentication.
   */
  flushUnload(): void {
    if (this.flushing || this.messages.length === 0) return;

    const batch = this.messages.slice(0, MAX_BATCH_SIZE);
    const payload: BatchPayload = { messages: batch };

    // Fire-and-forget: keepalive lets the request survive navigation
    this.transport.send(this.endpointUrl, this.publishableKey, payload, { keepalive: true });
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
    this.storageRemove();
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
    if (this.storagePrefix) {
      this.storagePrefixedSet(this.messages);
    } else {
      storage.setItem(STORAGE_KEY, this.messages);
    }
  }

  private storageGet(): unknown | undefined {
    if (this.storagePrefix) {
      return this.storagePrefixedGet();
    }
    return storage.getItem(STORAGE_KEY);
  }

  private storageRemove(): void {
    if (this.storagePrefix) {
      try {
        localStorage.removeItem(`${this.storagePrefix}${STORAGE_KEY}`);
      } catch { /* ignore */ }
    } else {
      storage.removeItem(STORAGE_KEY);
    }
  }

  private storagePrefixedGet(): unknown | undefined {
    try {
      const raw = localStorage.getItem(`${this.storagePrefix}${STORAGE_KEY}`);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  }

  private storagePrefixedSet(value: unknown): void {
    try {
      localStorage.setItem(
        `${this.storagePrefix}${STORAGE_KEY}`,
        JSON.stringify(value),
      );
    } catch { /* storage full */ }
  }
}
