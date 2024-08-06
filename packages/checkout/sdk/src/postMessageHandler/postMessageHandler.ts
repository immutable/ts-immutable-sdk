import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { PostMessageHandlerEventType, PostMessagePayload } from './postMessageEventTypes';

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

  private messageStream!: WindowPostMessageStream;

  constructor({
    targetOrigin,
    eventTarget,
    eventSource = window,
  }: PostMessageHandlerConfiguration) {
    this.handleMessage = this.handleMessage.bind(this);
    this.targetOrigin = targetOrigin;
    this.eventSource = eventSource;
    this.eventTarget = eventTarget;

    this.messageStream = new WindowPostMessageStream({
      name: 'handler',
      target: 'target',
      targetOrigin: this.targetOrigin,
      targetWindow: this.eventTarget,
    });

    (this.messageStream as any).on('data', this.handleMessage);
  }

  public send(type: PostMessageHandlerEventType, payload: any) {
    const message: PostMessageData = { type, payload };
    (this.messageStream as any).write(message);
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

  private handleMessage(data: any) {
    const message: PostMessageData = data;
    this.subscribers.forEach((handler) => handler(message));
  }

  public destroy() {
    (this.messageStream as any).destroy();
  }
}
