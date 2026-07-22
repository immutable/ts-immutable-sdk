import type { Message, BatchPayload } from './types';
import type { HttpSend } from './transport';
import {
  AudienceError, invokeOnError, toAudienceError, type MessageRejection, type TransportResult,
} from './errors';
import {
  BASE_URL, INGEST_PATH, FLUSH_INTERVAL_MS, FLUSH_SIZE,
} from './config';
import * as storage from './storage';
import { isBrowser } from './utils';

const STORAGE_KEY = 'queue';
const MAX_BATCH_SIZE = 100; // Backend maxItems limit per OAS

export interface MessageQueueOptions {
  /** Override the default API base URL for the ingest endpoint. */
  baseUrl?: string;
  /** Queue flush interval in milliseconds. Defaults to 5 000. */
  flushIntervalMs?: number;
  /** Number of queued messages that triggers an automatic flush. Defaults to 20. */
  flushSize?: number;
  /**
   * Fired after every flush, success or failure. Used for debug
   * logging / metrics. Errors are reported separately via `onError`.
   */
  onFlush?: (ok: boolean, count: number) => void;
  /**
   * Fired when a flush fails. The error has been mapped from the raw
   * transport-level failure into a public {@link AudienceError} via
   * {@link toAudienceError}, so the same shape comes out of every
   * audience surface (web, pixel, ...). Exceptions thrown from the
   * callback are swallowed so the queue can't wedge on a bad handler.
   */
  onError?: (err: AudienceError) => void;
  staleFilter?: (msg: Message) => boolean;
  /**
   * Override the localStorage key prefix (default: '__imtbl_audience_').
   * Use when multiple SDK surfaces run on the same page to prevent
   * queue collision, e.g. web SDK uses '__imtbl_web_' so its queued
   * messages don't interfere with the shared SDK's queue.
   */
  storagePrefix?: string;
  /** Prefix for the default per-rejected-message console.error (e.g. '[audience]', '[pixel]'). */
  logPrefix?: string;
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

  private readonly onError?: (err: AudienceError) => void;

  private readonly staleFilter?: (msg: Message) => boolean;

  private readonly storagePrefix?: string;

  private readonly logPrefix: string;

  private readonly endpointUrl: string;

  private readonly flushIntervalMs: number;

  private readonly flushSize: number;

  private consecutiveFailures = 0;

  // Epoch ms before which flush() is a no-op. Zero = no active backoff.
  private nextAttemptAt = 0;

  constructor(
    private readonly send: HttpSend,
    private readonly publishableKey: string,
    options?: MessageQueueOptions,
  ) {
    this.endpointUrl = `${options?.baseUrl ?? BASE_URL}${INGEST_PATH}`;
    this.flushIntervalMs = options?.flushIntervalMs ?? FLUSH_INTERVAL_MS;
    this.flushSize = options?.flushSize ?? FLUSH_SIZE;
    this.onFlush = options?.onFlush;
    this.onError = options?.onError;
    this.staleFilter = options?.staleFilter;
    this.storagePrefix = options?.storagePrefix;
    this.logPrefix = options?.logPrefix ?? '[audience]';

    const restored = (storage.getItem(STORAGE_KEY, this.storagePrefix) as Message[] | undefined) ?? [];
    this.messages = this.staleFilter
      ? restored.filter(this.staleFilter)
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
   * flushUnload() instead; it's fire-and-forget and survives navigation.
   */
  async flush(): Promise<void> {
    if (this.flushing || this.messages.length === 0) return;
    if (Date.now() < this.nextAttemptAt) return;

    this.flushing = true;
    try {
      // Messages can go stale while queued (offline, backoff, backgrounded
      // tab) without ever going through a restore, which is the only other
      // place staleFilter runs. Re-check here so a batch isn't sent only to
      // be rejected for a timestamp that was fine when it was enqueued.
      if (this.staleFilter) {
        const before = this.messages.length;
        this.messages = this.messages.filter(this.staleFilter);
        const dropped = before - this.messages.length;
        if (dropped > 0) {
          this.persist();
          invokeOnError(this.onError, new AudienceError({
            code: 'VALIDATION_REJECTED',
            message: `${dropped} queued message(s) exceeded the backend's accepted timestamp `
              + 'window and were dropped without sending',
            status: 0,
            endpoint: this.endpointUrl,
          }));
        }
        if (this.messages.length === 0) return;
      }

      const batch = this.messages.slice(0, MAX_BATCH_SIZE);
      const payload: BatchPayload = { messages: batch };

      const result = await this.send(this.endpointUrl, this.publishableKey, payload);
      const audienceErr = MessageQueue.deriveError(result, batch.length);

      // Drop the batch on success OR on a terminal validation failure.
      // VALIDATION_REJECTED means the backend deterministically rejected
      // some messages - retrying won't help, so we drop them rather than
      // accumulate stale data forever.
      const isTerminal = audienceErr?.code === 'VALIDATION_REJECTED';
      if (result.ok || isTerminal) {
        this.messages = this.messages.slice(batch.length);
        this.persist();
        this.resetBackoff();
      } else if (audienceErr) {
        // 429 with Retry-After overrides the exponential schedule.
        if (result.retryAfterMs !== undefined) {
          this.setBackoffUntil(Date.now() + result.retryAfterMs);
        } else {
          this.recordFailure();
        }
      }

      this.reportOutcome(result, audienceErr, batch.length);
    } finally {
      this.flushing = false;
    }
  }

  /**
   * Fire-and-forget flush for page-unload scenarios.
   *
   * Uses `fetch` with `keepalive: true` so the request survives page
   * navigation. Unlike `flush()`, this is synchronous and does not wait
   * for the response; use it only in `visibilitychange`/`pagehide`
   * handlers or in `shutdown()`. If a response does arrive, `onFlush`/
   * `onError`/the default rejection log still fire from it; this is
   * reliable when the trigger was tab-backgrounding, not guaranteed when
   * the page is actually torn down.
   */
  flushUnload(): void {
    if (this.flushing || this.messages.length === 0) return;

    const batch = this.messages.slice(0, MAX_BATCH_SIZE);
    const payload: BatchPayload = { messages: batch };

    // We optimistically drop the batch because the page is going away and
    // can't retry. Attaching .then() with no .catch() is safe: HttpSend
    // never rejects, and reportOutcome guards every callback it calls.
    this.send(this.endpointUrl, this.publishableKey, payload, { keepalive: true })
      .then((result) => this.reportOutcome(result, MessageQueue.deriveError(result, batch.length), batch.length));
    this.messages = this.messages.slice(batch.length);
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

  private backoffDelayMs(): number {
    switch (this.consecutiveFailures) {
      case 0: return 0;
      case 1: return 5_000;
      case 2: return 10_000;
      case 3: return 20_000;
      case 4: return 40_000;
      default: return 60_000;
    }
  }

  private recordFailure(): void {
    const now = Date.now();
    // Don't compound backoff if we're already inside a prior window.
    if (now < this.nextAttemptAt) return;
    this.consecutiveFailures++;
    this.nextAttemptAt = now + this.backoffDelayMs();
  }

  private setBackoffUntil(untilMs: number): void {
    this.consecutiveFailures++;
    this.nextAttemptAt = untilMs;
  }

  private resetBackoff(): void {
    this.consecutiveFailures = 0;
    this.nextAttemptAt = 0;
  }

  private static deriveError(result: TransportResult, batchLength: number): AudienceError | undefined {
    return !result.ok && result.error ? toAudienceError(result.error, 'flush', batchLength) : undefined;
  }

  // Batch retention/backoff stay the caller's job: flushUnload() has already
  // unconditionally dropped its batch by the time this runs.
  private reportOutcome(result: TransportResult, audienceErr: AudienceError | undefined, batchLength: number): void {
    // Guarded like invokeOnError: a throwing onFlush must not become an
    // unhandled rejection on flushUnload()'s floating promise.
    try {
      this.onFlush?.(result.ok, batchLength);
    } catch {
      // Swallow; handler must not crash the queue.
    }
    if (audienceErr) {
      if (audienceErr.rejections?.length) this.logRejections(audienceErr.rejections);
      invokeOnError(this.onError, audienceErr);
    }
  }

  // Fires unconditionally, independent of onError, so a rejection the SDK
  // didn't catch client-side doesn't fail silently. console.error, not
  // warn: this is lost data, not an advisory.
  private logRejections(rejections: MessageRejection[]): void {
    for (const rejection of rejections) {
      const reasons = rejection.errors.map((e) => `${e.field} ${e.code}: ${e.message}`).join('; ');
      // eslint-disable-next-line no-console
      console.error(`${this.logPrefix} messageId ${rejection.messageId} rejected by the server: ${reasons}`);
    }
  }

  private persist(): void {
    storage.setItem(STORAGE_KEY, this.messages, this.storagePrefix);
  }
}
