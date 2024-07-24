export type PostMessageHandlerConfiguration = {
  targetOrigin: string;
  eventTarget: Window;
  eventSource?: Window;
};

export enum PostMessageHandlerEventType {
  PROVIDER_RELAY = 'PROVIDER_RELAY',
}

type PostMessageData = {
  type: PostMessageHandlerEventType;
  payload: any;
};

export class PostMessageHandler {
  private eventHandlers: Map<PostMessageHandlerEventType, (data: any) => void> = new Map();

  private targetOrigin!: string;

  private eventSource!: Window;

  private eventTarget!: Window;

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
