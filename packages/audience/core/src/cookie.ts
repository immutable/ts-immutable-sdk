import { COOKIE_NAME, COOKIE_MAX_AGE_SECONDS } from './config';
import { isBrowser, generateId } from './utils';

export function getCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function setCookie(name: string, value: string, maxAge: number, domain?: string): void {
  if (!isBrowser()) return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const domainAttr = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=${encodeURIComponent(value)}`
    + `; path=/; max-age=${maxAge}; SameSite=Lax${domainAttr}${secure}`;
}

export function deleteCookie(name: string, domain?: string): void {
  setCookie(name, '', 0, domain);
}

/**
 * Returns the anonymous ID from the shared cookie, creating one if it doesn't exist.
 * Both the web SDK and pixel read/write the same cookie so identity stitching
 * works across surfaces on the same domain.
 */
export function getOrCreateAnonymousId(domain?: string): string {
  const existing = getCookie(COOKIE_NAME);
  if (existing) return existing;

  const id = generateId();
  setCookie(COOKIE_NAME, id, COOKIE_MAX_AGE_SECONDS, domain);
  return id;
}

export function getAnonymousId(): string | undefined {
  return getCookie(COOKIE_NAME);
}
