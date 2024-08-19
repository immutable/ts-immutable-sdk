import {
  PostMessageHandlerEventType,
  PostMessagePayload,
} from './postMessageEventTypes';

export type PostMessageHandlerConfiguration = {
  targetOrigin: string;
  eventTarget: WindowProxy;
  eventSource?: WindowProxy;
};

export type PostMessageData = {
  type: PostMessageHandlerEventType;
  payload: PostMessagePayload;
};

export class PostMessageHandler {
  private init: boolean = false;

  private haveSyn: boolean = false;

  private subscribers: Array<(message: PostMessageData) => void> = [];

  private queue: PostMessageData[] = [];

  private targetOrigin!: string;

  private eventTarget!: WindowProxy;

  private eventSource!: WindowProxy;

  private logger: (...args: any[]) => void;

  constructor({
    targetOrigin,
    eventTarget,
    eventSource = window,
  }: PostMessageHandlerConfiguration) {
    if (!targetOrigin) {
      throw new Error('targetOrigin is required');
    }

    if (!eventTarget) {
      throw new Error('eventTarget is required');
    }

    if (typeof eventTarget.postMessage !== 'function') {
      throw new Error(
        'eventTarget.postMessage is not a function. This class should only be instantiated in a Window.',
      );
    }

    this.targetOrigin = targetOrigin;
    this.eventSource = eventSource;
    this.eventTarget = eventTarget;
    this.logger = () => {};

    this.eventSource.addEventListener('message', this.onMessage);
    this.handshake();
  }

  public setLogger(logger: any) {
    this.logger = logger;
  }

  static isSynOrAck = (type: PostMessageHandlerEventType): boolean => type === PostMessageHandlerEventType.SYN
    || type === PostMessageHandlerEventType.ACK;

  protected handshake = (): void => {
    this.postMessage(PostMessageHandlerEventType.SYN, null);
  };

  protected onMessage = (event: MessageEvent): void => {
    if (event.origin !== this.targetOrigin) return;

    if (this.init) {
      this.handleMessage(event);
    } else if (event.data?.type === PostMessageHandlerEventType.SYN) {
      this.haveSyn = true;
      this.postMessage(PostMessageHandlerEventType.ACK, null);
    } else if (event.data?.type === PostMessageHandlerEventType.ACK) {
      this.init = true;
      if (!this.haveSyn) {
        this.postMessage(PostMessageHandlerEventType.ACK, null);
      }
      this.flushQueue();
    }
  };

  private flushQueue(): void {
    while (this.queue.length > 0) {
      const message = this.queue.shift();

      if (message) {
        this.logger('Flush message:', message);
        this.send(message.type, message.payload);
      }
    }
  }

  private postMessage(type: PostMessageHandlerEventType, payload: any): void {
    const message: PostMessageData = { type, payload };
    this.eventTarget.postMessage(message, this.targetOrigin);

    if (!PostMessageHandler.isSynOrAck(type)) {
      this.logger('Send message:', { type, payload });
    }
  }

  public send(type: PostMessageHandlerEventType, payload: any): void {
    if (this.init || PostMessageHandler.isSynOrAck(type)) {
      this.postMessage(type, payload);
      return;
    }

    this.logger('Queue message:', { type, payload });
    this.queue.push({ type, payload });
  }

  public subscribe(handler: (message: PostMessageData) => void): () => void {
    this.subscribers.push(handler);

    return () => {
      this.unsubscribe(handler);
    };
  }

  private unsubscribe(handler: (message: PostMessageData) => void): void {
    const index = this.subscribers.indexOf(handler);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  private handleMessage = (event: MessageEvent) => {
    const message: PostMessageData = event.data;

    if (!PostMessageHandler.isSynOrAck(message.type)) {
      this.logger('Received message:', message);
    }

    this.subscribers.forEach((handler) => handler(message));
  };

  public destroy() {
    this.eventSource.removeEventListener('message', this.onMessage);
  }
}
