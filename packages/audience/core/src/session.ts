import { getCookie, setCookie } from './cookie';
import { generateId } from './utils';
import { SESSION_COOKIE, SESSION_MAX_AGE } from './config';

export interface SessionResult {
  sessionId: string;
  isNew: boolean;
}

/**
 * Get or create a session ID.
 *
 * The session cookie has a 30-minute rolling expiry — each call refreshes it.
 * Returns whether the session is new so the caller can fire a `session_start` event.
 */
export function getOrCreateSession(domain?: string): SessionResult {
  const existing = getCookie(SESSION_COOKIE);
  if (existing) {
    // Refresh the rolling expiry
    setCookie(SESSION_COOKIE, existing, SESSION_MAX_AGE, domain);
    return { sessionId: existing, isNew: false };
  }

  const id = generateId();
  setCookie(SESSION_COOKIE, id, SESSION_MAX_AGE, domain);
  return { sessionId: id, isNew: true };
}

/** Convenience wrapper that returns just the session ID string. */
export function getOrCreateSessionId(domain?: string): string {
  return getOrCreateSession(domain).sessionId;
}

export function getSessionId(): string | undefined {
  return getCookie(SESSION_COOKIE);
}
