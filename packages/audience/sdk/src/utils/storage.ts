import { isBrowser } from './utils';

const PREFIX = '__imtbl_audience_';

const hasLocalStorage = (): boolean => {
  try {
    return isBrowser() && !!window.localStorage;
  } catch {
    return false;
  }
};

export const getItem = <T>(key: string): T | undefined => {
  if (!hasLocalStorage()) return undefined;
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

export const setItem = (key: string, value: unknown): void => {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently degrade.
  }
};

export const removeItem = (key: string): void => {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Ignore.
  }
};
