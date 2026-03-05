import type { Message, BatchPayload } from '../types';
import type { Transport } from './transport';
import * as storage from './storage';

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
 */
export class MessageQueue {
  private messages: Message[];

  private timer: ReturnType<typeof setInterval> | null = null;

  private flushing = false;

  constructor(
    private readonly transport: Transport,
    private readonly endpointUrl: string,
    private readonly publishableKey: string,
    private readonly flushIntervalMs: number,
    private readonly flushSize: number,
  ) {
    this.messages = storage.getItem<Message[]>(STORAGE_KEY) ?? [];
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
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

  clear(): void {
    this.messages = [];
    storage.removeItem(STORAGE_KEY);
  }

  private persist(): void {
    storage.setItem(STORAGE_KEY, this.messages);
  }
}
