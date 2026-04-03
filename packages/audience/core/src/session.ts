import * as storage from './storage';
import { generateId } from './utils';
import { SESSION_TIMEOUT_MS } from './config';

const SESSION_ID_KEY = 'session_id';
const SESSION_LAST_ACTIVITY_KEY = 'session_last_activity';

/**
 * Returns the current session ID, creating a new one if:
 * - No session exists yet
 * - The last activity was more than 30 minutes ago
 *
 * Each call refreshes the last-activity timestamp (rolling window).
 */
export function getSessionId(): string {
  const now = Date.now();
  const lastActivity = storage.getItem(SESSION_LAST_ACTIVITY_KEY) as number | undefined;
  const existingId = storage.getItem(SESSION_ID_KEY) as string | undefined;

  if (existingId && lastActivity && now - lastActivity < SESSION_TIMEOUT_MS) {
    storage.setItem(SESSION_LAST_ACTIVITY_KEY, now);
    return existingId;
  }

  const newId = generateId();
  storage.setItem(SESSION_ID_KEY, newId);
  storage.setItem(SESSION_LAST_ACTIVITY_KEY, now);
  return newId;
}

/** Force-starts a new session. Useful for testing or explicit session boundaries. */
export function resetSession(): void {
  storage.removeItem(SESSION_ID_KEY);
  storage.removeItem(SESSION_LAST_ACTIVITY_KEY);
}
