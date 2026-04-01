export type Environment = 'dev' | 'sandbox' | 'production';

export type Surface = 'web' | 'pixel' | 'unity' | 'unreal';

export type MessageType = 'track' | 'page' | 'screen' | 'identify' | 'alias';

export interface EventContext {
  library: string;
  libraryVersion: string;
  userAgent?: string;
  locale?: string;
  timezone?: string;
  screen?: string;
  pageUrl?: string;
  pagePath?: string;
  pageReferrer?: string;
  pageTitle?: string;
}

export interface UserTraits {
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

interface BaseMessage {
  type: MessageType;
  messageId: string;
  eventTimestamp: string;
  anonymousId: string;
  surface: Surface;
  context: EventContext;
}

export interface TrackMessage extends BaseMessage {
  type: 'track';
  eventName: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface PageMessage extends BaseMessage {
  type: 'page';
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface ScreenMessage extends BaseMessage {
  type: 'screen';
  eventName?: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface IdentifyMessage extends BaseMessage {
  type: 'identify';
  userId?: string;
  identityType?: string;
  traits?: UserTraits;
}

export interface AliasMessage extends BaseMessage {
  type: 'alias';
  fromId: string;
  fromType?: string;
  toId: string;
  toType?: string;
}

export type Message =
  | TrackMessage
  | PageMessage
  | ScreenMessage
  | IdentifyMessage
  | AliasMessage;

export interface BatchPayload {
  messages: Message[];
}
