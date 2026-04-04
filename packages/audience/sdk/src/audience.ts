import type {
  AudienceConfig,
  IdentityType,
  Surface,
  UserTraits,
  TrackMessage,
  IdentifyMessage,
  AliasMessage,
} from './types';
import type {
  AudienceEvent, EventParamMap, Identity, IdentityProvider,
} from './events';
import {
  getBaseUrl,
  MESSAGES_ENDPOINT,
  DEFAULT_FLUSH_INTERVAL_MS,
  DEFAULT_FLUSH_SIZE,
} from './config';
import { MessageQueue } from './utils/queue';
import { httpTransport } from './utils/transport';
import { collectContext } from './utils/runtime';
import { generateId, getTimestamp } from './utils/utils';
import * as storage from './utils/storage';

const ANON_ID_KEY = 'anonymousId';
const USER_ID_KEY = 'userId';
const IDENTITY_TYPE_KEY = 'identityType';

export class Audience {
  private readonly queue: MessageQueue;

  private readonly anonymousId: string;

  private readonly surface: Surface | undefined;

  private userId: string | undefined;

  private identityType: IdentityType | undefined;

  constructor(config: AudienceConfig) {
    const baseUrl = getBaseUrl(config.environment);
    this.surface = config.surface;

    this.anonymousId = storage.getItem<string>(ANON_ID_KEY) ?? generateId();
    storage.setItem(ANON_ID_KEY, this.anonymousId);

    this.userId = storage.getItem<string>(USER_ID_KEY);
    this.identityType = storage.getItem<IdentityType>(IDENTITY_TYPE_KEY);

    this.queue = new MessageQueue(
      httpTransport,
      `${baseUrl}${MESSAGES_ENDPOINT}`,
      config.publishableKey,
      DEFAULT_FLUSH_INTERVAL_MS,
      DEFAULT_FLUSH_SIZE,
    );

    this.queue.start();
  }

  // -------------------------------------------------------------------------
  // track – record a predefined player event
  // -------------------------------------------------------------------------

  track<E extends AudienceEvent>(
    event: E,
    properties: EventParamMap[E],
  ): void {
    const message: TrackMessage = {
      type: 'track',
      eventName: event,
      properties: properties as Record<string, unknown>,
      userId: this.userId,
      anonymousId: this.anonymousId,
      eventTimestamp: getTimestamp(),
      messageId: generateId(),
      context: collectContext(),
      surface: this.surface,
    };
    this.queue.enqueue(message);
  }

  // -------------------------------------------------------------------------
  // identify – associate all future events with a known user
  // -------------------------------------------------------------------------

  identify(provider: IdentityProvider, uid: string, traits?: UserTraits): void {
    this.userId = uid;
    this.identityType = provider as IdentityType;
    storage.setItem(USER_ID_KEY, this.userId);
    storage.setItem(IDENTITY_TYPE_KEY, this.identityType);

    const message: IdentifyMessage = {
      type: 'identify',
      userId: uid,
      identityType: provider as IdentityType,
      traits,
      anonymousId: this.anonymousId,
      eventTimestamp: getTimestamp(),
      messageId: generateId(),
      context: collectContext(),
      surface: this.surface,
    };
    this.queue.enqueue(message);
  }

  // -------------------------------------------------------------------------
  // alias – link two user IDs so the backend merges their profiles
  // -------------------------------------------------------------------------

  alias(from: Identity, to: Identity): void {
    const message: AliasMessage = {
      type: 'alias',
      fromId: from.uid,
      fromType: from.provider as IdentityType,
      toId: to.uid,
      toType: to.provider as IdentityType,
      anonymousId: this.anonymousId,
      eventTimestamp: getTimestamp(),
      messageId: generateId(),
      context: collectContext(),
      surface: this.surface,
    };
    this.queue.enqueue(message);
  }

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------

  /** Force-send all queued messages now (e.g. before page unload). */
  async flush(): Promise<void> {
    await this.queue.flush();
  }

  /** Clear the current identity. Call on logout. */
  reset(): void {
    this.userId = undefined;
    this.identityType = undefined;
    storage.removeItem(USER_ID_KEY);
    storage.removeItem(IDENTITY_TYPE_KEY);
  }

  /** Stop the flush loop and wipe all local state. */
  shutdown(): void {
    this.queue.stop();
    this.queue.clear();
    this.reset();
    storage.removeItem(ANON_ID_KEY);
  }
}
