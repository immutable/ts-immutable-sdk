import { getCookie, setCookie } from './cookie';
import { generateId } from './utils';
import { SESSION_COOKIE, SESSION_MAX_AGE } from './config';

/**
 * Get or create a session ID.
 *
 * The session cookie has a 30-minute rolling expiry — each call refreshes it,
 * so a session ends after 30 minutes of inactivity.
 */
export function getOrCreateSessionId(domain?: string): string {
  const existing = getCookie(SESSION_COOKIE);
  if (existing) {
    setCookie(SESSION_COOKIE, existing, SESSION_MAX_AGE, domain);
    return existing;
  }
  const id = generateId();
  setCookie(SESSION_COOKIE, id, SESSION_MAX_AGE, domain);
  return id;
}

export function getSessionId(): string | undefined {
  return getCookie(SESSION_COOKIE);
}
