import { COOKIE_NAME, COOKIE_MAX_AGE_SECONDS } from './config';
import { isBrowser, generateId } from './utils';

function getCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Returns the anonymous ID from the shared cookie, creating one if it doesn't exist.
 * Both the web SDK and pixel read/write the same cookie so identity stitching
 * works across surfaces on the same domain.
 */
export function getOrCreateAnonymousId(): string {
  const existing = getCookie(COOKIE_NAME);
  if (existing) return existing;

  const id = generateId();
  setCookie(COOKIE_NAME, id, COOKIE_MAX_AGE_SECONDS);
  return id;
}

export function getAnonymousId(): string | undefined {
  return getCookie(COOKIE_NAME);
}
