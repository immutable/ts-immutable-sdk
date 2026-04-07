import { getCookie, setCookie, generateId } from '@imtbl/audience-core';

const SESSION_COOKIE_NAME = '_imtbl_sid';
const SESSION_MAX_AGE = 30 * 60; // 30 minutes in seconds

/**
 * Get or create a session ID.
 *
 * The session cookie has a 30-minute rolling expiry — each call refreshes it.
 * This gives us session-scoped grouping of pixel events.
 */
export function getOrCreateSessionId(domain?: string): string {
  const existing = getCookie(SESSION_COOKIE_NAME);
  if (existing) {
    // Refresh the rolling expiry
    setCookie(SESSION_COOKIE_NAME, existing, SESSION_MAX_AGE, domain);
    return existing;
  }

  const id = generateId();
  setCookie(SESSION_COOKIE_NAME, id, SESSION_MAX_AGE, domain);
  return id;
}

export function getSessionId(): string | undefined {
  return getCookie(SESSION_COOKIE_NAME);
}
