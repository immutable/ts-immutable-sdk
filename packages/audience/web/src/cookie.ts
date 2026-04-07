import {
  SESSION_COOKIE,
  getCookie,
  setCookie,
  generateId,
} from '@imtbl/audience-core';

/** 30 minutes in seconds — session cookie rolls on every SDK interaction. */
const SESSION_MAX_AGE = 30 * 60;

/** Return value from getOrCreateSessionId. */
export interface SessionResult {
  /** The session UUID (persisted in _imtbl_sid cookie). */
  sessionId: string;
  /** True if this call created a new session (no existing cookie). */
  isNew: boolean;
}

export function getOrCreateSessionId(domain?: string): SessionResult {
  const existing = getCookie(SESSION_COOKIE);
  const isNew = !existing;
  const sid = existing ?? generateId();
  setCookie(SESSION_COOKIE, sid, SESSION_MAX_AGE, domain);
  return { sessionId: sid, isNew };
}

export function renewSession(domain?: string): void {
  const sid = getCookie(SESSION_COOKIE);
  if (sid) {
    setCookie(SESSION_COOKIE, sid, SESSION_MAX_AGE, domain);
  }
}
