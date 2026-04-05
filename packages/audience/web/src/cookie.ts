import {
  ANON_ID_COOKIE,
  SESSION_COOKIE,
  CONSENT_COOKIE,
} from '@imtbl/audience-core';
import { generateId, isBrowser } from './utils';

const ANON_ID_MAX_AGE = 2 * 365 * 24 * 60 * 60; // 2 years
const SESSION_MAX_AGE = 30 * 60; // 30 minutes (rolling)
const CONSENT_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

// Re-export cookie names for convenience
export { ANON_ID_COOKIE, SESSION_COOKIE, CONSENT_COOKIE };

// --- Helpers ---

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- Low-level cookie operations ---

export function getCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapeRegExp(name)}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function setCookie(
  name: string,
  value: string,
  maxAge: number,
  domain?: string,
): void {
  if (!isBrowser()) return;
  let cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
  if (domain) cookie += `;domain=${domain}`;
  if (window.location.protocol === 'https:') cookie += ';Secure';
  document.cookie = cookie;
}

export function deleteCookie(name: string, domain?: string): void {
  setCookie(name, '', 0, domain);
}

// --- Anonymous ID (shared with pixel via imtbl_anon_id cookie, 2yr) ---

export function getOrCreateAnonymousId(domain?: string): string {
  let id = getCookie(ANON_ID_COOKIE);
  if (!id) {
    id = generateId();
    setCookie(ANON_ID_COOKIE, id, ANON_ID_MAX_AGE, domain);
  }
  return id;
}

// --- Session ID (_imtbl_sid cookie, 30min rolling) ---

export function getOrCreateSessionId(domain?: string): string {
  let sid = getCookie(SESSION_COOKIE);
  if (!sid) {
    sid = generateId();
  }
  // Always reset rolling expiry
  setCookie(SESSION_COOKIE, sid, SESSION_MAX_AGE, domain);
  return sid;
}

export function touchSession(domain?: string): void {
  const sid = getCookie(SESSION_COOKIE);
  if (sid) {
    setCookie(SESSION_COOKIE, sid, SESSION_MAX_AGE, domain);
  }
}

// --- Consent cookie (_imtbl_consent, 1yr) ---

export function getConsentCookie(): string | undefined {
  return getCookie(CONSENT_COOKIE);
}

export function setConsentCookie(level: string, domain?: string): void {
  setCookie(CONSENT_COOKIE, level, CONSENT_MAX_AGE, domain);
}
