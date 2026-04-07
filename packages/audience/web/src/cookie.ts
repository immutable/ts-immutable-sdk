import {
  SESSION_COOKIE,
  getCookie,
  setCookie,
  generateId,
} from '@imtbl/audience-core';

const SESSION_MAX_AGE = 30 * 60; // 30 minutes (rolling)

// --- Session ID (_imtbl_sid cookie, 30min rolling) ---

export interface SessionResult {
  sessionId: string;
  isNew: boolean;
}

export function getOrCreateSessionId(domain?: string): SessionResult {
  const existing = getCookie(SESSION_COOKIE);
  const isNew = !existing;
  const sid = existing ?? generateId();
  setCookie(SESSION_COOKIE, sid, SESSION_MAX_AGE, domain);
  return { sessionId: sid, isNew };
}

export function getSessionId(): string | undefined {
  return getCookie(SESSION_COOKIE);
}

export function touchSession(domain?: string): void {
  const sid = getCookie(SESSION_COOKIE);
  if (sid) {
    setCookie(SESSION_COOKIE, sid, SESSION_MAX_AGE, domain);
  }
}
