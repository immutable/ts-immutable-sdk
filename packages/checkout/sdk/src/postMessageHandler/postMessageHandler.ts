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
  private subscribers: Array<(message: PostMessageData) => void> = [];

  private targetOrigin!: string;

  private eventTarget!: WindowProxy;

  private eventSource!: WindowProxy;

  constructor({
    targetOrigin,
    eventTarget,
    eventSource = window,
  }: PostMessageHandlerConfiguration) {
    this.targetOrigin = targetOrigin;
    this.eventSource = eventSource;
    this.eventTarget = eventTarget;

    this.eventSource.addEventListener('message', this.handleMessage);
  }

  public send(type: PostMessageHandlerEventType, payload: any) {
    const message: PostMessageData = { type, payload };
    this.eventTarget.postMessage(message, this.targetOrigin);
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

  private handleMessage(event: MessageEvent) {
    if (event.origin !== this.targetOrigin) return;

    const message: PostMessageData = event.data;

    this.subscribers.forEach((handler) => handler(message));
  }

  public destroy() {
    this.eventSource.removeEventListener('message', this.handleMessage);
  }
}
