import { isBrowser } from './utils';

const PREFIX = '__imtbl_audience_';

function hasLocalStorage(): boolean {
  try {
    return isBrowser() && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getItem(key: string): unknown | undefined {
  if (!hasLocalStorage()) return undefined;
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function setItem(key: string, value: unknown): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Storage full or unavailable.
  }
}

export function removeItem(key: string): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Ignore.
  }
}
