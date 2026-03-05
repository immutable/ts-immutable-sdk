import type {
  AudienceConfig,
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
  EVENTS_ENDPOINT,
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

const formatUserId = (provider: IdentityProvider, uid: string): string => `${provider}:${uid}`;

export class Audience {
  private readonly queue: MessageQueue;

  private readonly anonymousId: string;

  private userId: string | undefined;

  constructor(config: AudienceConfig) {
    const baseUrl = getBaseUrl(config.environment);

    this.anonymousId = storage.getItem<string>(ANON_ID_KEY) ?? generateId();
    storage.setItem(ANON_ID_KEY, this.anonymousId);

    this.userId = storage.getItem<string>(USER_ID_KEY);

    this.queue = new MessageQueue(
      httpTransport,
      `${baseUrl}${EVENTS_ENDPOINT}`,
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
      event,
      properties: properties as Record<string, unknown>,
      userId: this.userId,
      anonymousId: this.anonymousId,
      timestamp: getTimestamp(),
      messageId: generateId(),
      context: collectContext(),
    };
    this.queue.enqueue(message);
  }

  // -------------------------------------------------------------------------
  // identify – associate all future events with a known user
  // -------------------------------------------------------------------------

  identify(provider: IdentityProvider, uid: string, traits?: UserTraits): void {
    this.userId = formatUserId(provider, uid);
    storage.setItem(USER_ID_KEY, this.userId);

    const message: IdentifyMessage = {
      type: 'identify',
      userId: this.userId,
      provider,
      traits,
      anonymousId: this.anonymousId,
      timestamp: getTimestamp(),
      messageId: generateId(),
      context: collectContext(),
    };
    this.queue.enqueue(message);
  }

  // -------------------------------------------------------------------------
  // alias – link two user IDs so the backend merges their profiles
  // -------------------------------------------------------------------------

  alias(from: Identity, to: Identity): void {
    const message: AliasMessage = {
      type: 'alias',
      previousId: formatUserId(from.provider, from.uid),
      previousProvider: from.provider,
      userId: formatUserId(to.provider, to.uid),
      provider: to.provider,
      anonymousId: this.anonymousId,
      timestamp: getTimestamp(),
      messageId: generateId(),
      context: collectContext(),
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
    storage.removeItem(USER_ID_KEY);
  }

  /** Stop the flush loop and wipe all local state. */
  shutdown(): void {
    this.queue.stop();
    this.queue.clear();
    this.reset();
    storage.removeItem(ANON_ID_KEY);
  }
}
