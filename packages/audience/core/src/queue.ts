import type { Message, BatchPayload } from './types';
import type { Transport } from './transport';
import * as storage from './storage';

const STORAGE_KEY = 'queue';

/**
 * Batched message queue with localStorage durability.
 *
 * Flushes on a timer or when the queue reaches the batch size, whichever
 * comes first. Failed sends stay queued for the next cycle. localStorage
 * is used as a write-through cache so messages survive page navigations.
 */
export class MessageQueue {
  private messages: Message[];
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;

  constructor(
    private readonly transport: Transport,
    private readonly url: string,
    private readonly apiKey: string,
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

  async flush(): Promise<void> {
    if (this.flushing || this.messages.length === 0) return;

    this.flushing = true;
    try {
      const batch = [...this.messages];
      const payload: BatchPayload = { messages: batch };

      const ok = await this.transport.send(this.url, this.apiKey, payload);
      if (ok) {
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

  get length(): number {
    return this.messages.length;
  }

  private persist(): void {
    storage.setItem(STORAGE_KEY, this.messages);
  }
}
