export type PostMessageHandlerConfiguration = {
  targetOrigin: string;
  eventTarget: MinimalEventTargetInterface;
  eventSource?: MinimalEventSourceInterface;
};

export enum PostMessageHandlerEventType {
  PROVIDER_RELAY = 'PROVIDER_RELAY',
}

type PostMessageData = {
  type: PostMessageHandlerEventType;
  payload: any;
};

export interface MinimalEventSourceInterface {
  addEventListener(eventType: 'message', handler: (message: MessageEvent) => void): void;
  removeEventListener(eventType: 'message', handler: (message: MessageEvent) => void): void;
}

export interface MinimalEventTargetInterface {
  postMessage(message: any, targetOrigin?: string): void;
}

export class PostMessageHandler {
  private eventHandlers: Map<PostMessageHandlerEventType, (data: any) => void> = new Map();

  private targetOrigin!: string;

  private eventTarget!: MinimalEventTargetInterface;

  private eventSource!: MinimalEventSourceInterface;

  constructor({
    targetOrigin,
    eventTarget,
    eventSource = window,
  }: PostMessageHandlerConfiguration) {
    this.handleMessage = this.handleMessage.bind(this);
    this.targetOrigin = targetOrigin;
    this.eventSource = eventSource;
    this.eventTarget = eventTarget;
    this.eventHandlers = new Map();

    this.eventSource.addEventListener('message', this.handleMessage);
  }

  public sendMessage(type: PostMessageHandlerEventType, payload: any) {
    const message: PostMessageData = { type, payload };
    this.eventTarget.postMessage(message, this.targetOrigin);
  }

  public addEventHandler(type: PostMessageHandlerEventType, handler: (data: any) => void): void {
    this.eventHandlers.set(type, handler);
  }

  public removeEventHandler(type: PostMessageHandlerEventType): void {
    this.eventHandlers.delete(type);
  }

  private handleMessage(event: MessageEvent) {
    if (event.origin !== this.targetOrigin) {
      return;
    }

    const message: PostMessageData = event.data;

    const handler = this.eventHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    }
  }

  public destroy() {
    this.eventSource.removeEventListener('message', this.handleMessage);
  }
}
