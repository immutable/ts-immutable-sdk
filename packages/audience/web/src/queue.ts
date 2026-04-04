import type { Message, MessagesRequest } from './types';
import { sendMessages } from './transport';
import { isTimestampValid } from './validation';
import * as storage from './storage';
import { isBrowser } from './utils';

const QUEUE_KEY = 'queue';
const MAX_BATCH_SIZE = 100; // Backend limit

export class MessageQueue {
  private messages: Message[];

  private timer: ReturnType<typeof setInterval> | null = null;

  private flushing = false;

  private unloadBound = false;

  private visibilityHandler?: () => void;

  private pagehideHandler?: () => void;

  constructor(
    private readonly endpointUrl: string,
    private readonly publishableKey: string,
    private readonly flushIntervalMs: number,
    private readonly flushSize: number,
    private readonly onFlush?: (ok: boolean, count: number) => void,
  ) {
    // Restore persisted messages, filtering out stale ones (>30 days old)
    const restored = storage.getItem<Message[]>(QUEUE_KEY) ?? [];
    this.messages = restored.filter((m) => isTimestampValid(m.eventTimestamp));
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
      const batch = this.messages.slice(0, MAX_BATCH_SIZE);
      const payload: MessagesRequest = { messages: batch };
      const ok = await sendMessages(this.endpointUrl, this.publishableKey, payload);

      if (ok) {
        this.messages = this.messages.slice(batch.length);
        this.persist();
      }
      this.onFlush?.(ok, batch.length);
    } finally {
      this.flushing = false;
    }
  }

  /** Fire-and-forget flush for page unload — uses fetch with keepalive. */
  flushUnload(): void {
    if (this.messages.length === 0) return;

    const batch = this.messages.slice(0, MAX_BATCH_SIZE);
    const payload: MessagesRequest = { messages: batch };
    // Fire-and-forget: keepalive lets the request survive navigation
    sendMessages(this.endpointUrl, this.publishableKey, payload, true);
    this.messages = this.messages.slice(batch.length);
    this.persist();
  }

  clear(): void {
    this.messages = [];
    storage.removeItem(QUEUE_KEY);
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

  private persist(): void {
    storage.setItem(QUEUE_KEY, this.messages);
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
}
