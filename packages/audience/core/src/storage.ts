import { isBrowser } from './utils';

const DEFAULT_PREFIX = '__imtbl_audience_';

function hasLocalStorage(): boolean {
  try {
    return isBrowser() && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getItem(key: string, prefix = DEFAULT_PREFIX): unknown | undefined {
  if (!hasLocalStorage()) return undefined;
  try {
    const raw = localStorage.getItem(`${prefix}${key}`);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function setItem(key: string, value: unknown, prefix = DEFAULT_PREFIX): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
  } catch {
    // Storage full or unavailable.
  }
}

export function removeItem(key: string, prefix = DEFAULT_PREFIX): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.removeItem(`${prefix}${key}`);
  } catch {
    // Ignore.
  }
}
