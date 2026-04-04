import { isBrowser } from './utils';

const PREFIX = '__imtbl_web_';

function hasLocalStorage(): boolean {
  try {
    return isBrowser() && !!window.localStorage;
  } catch {
    return false;
  }
}

export function getItem<T>(key: string): T | undefined {
  if (!hasLocalStorage()) return undefined;
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function setItem(key: string, value: unknown): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Storage full — silently degrade
  }
}

export function removeItem(key: string): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Ignore
  }
}
