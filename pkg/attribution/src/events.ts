import { getStorageAdapter, type StorageAdapter } from './storage';

const EVENT_QUEUE_KEY = '__imtbl_attribution_event_queue__';
const MAX_QUEUE_SIZE = 100;

export interface EventData {
  eventName: string;
  eventParams?: Record<string, string | number | boolean>;
  timestamp: number;
}

/**
 * Get event queue from storage
 */
function getEventQueue(storage: StorageAdapter): EventData[] {
  const queueStr = storage.getItem(EVENT_QUEUE_KEY);
  if (!queueStr) {
    return [];
  }

  try {
    const queue = JSON.parse(queueStr) as EventData[];
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}

/**
 * Save event queue to storage
 */
function saveEventQueue(storage: StorageAdapter, queue: EventData[]): void {
  // Limit queue size to prevent storage bloat
  const limitedQueue = queue.slice(-MAX_QUEUE_SIZE);
  storage.setItem(EVENT_QUEUE_KEY, JSON.stringify(limitedQueue));
}

/**
 * Add event to queue
 */
export function queueEvent(
  storage: StorageAdapter,
  eventName: string,
  eventParams?: Record<string, string | number | boolean>,
): void {
  const queue = getEventQueue(storage);
  const event: EventData = {
    eventName,
    eventParams,
    timestamp: Date.now(),
  };

  queue.push(event);
  saveEventQueue(storage, queue);
}

/**
 * Get all queued events
 */
export function getQueuedEvents(storage: StorageAdapter): EventData[] {
  return getEventQueue(storage);
}

/**
 * Clear event queue
 */
export function clearEventQueue(storage: StorageAdapter): void {
  storage.removeItem(EVENT_QUEUE_KEY);
}

/**
 * Remove events from queue (after successful send)
 */
export function removeEventsFromQueue(storage: StorageAdapter, count: number): void {
  const queue = getEventQueue(storage);
  const remaining = queue.slice(count);
  saveEventQueue(storage, remaining);
}

