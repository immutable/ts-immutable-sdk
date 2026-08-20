/**
 * Minimal namespaced localStorage helper for session activity counters.
 * Uses the same `__IMX-` prefix as the former metrics utils export.
 */

const PREFIX = '__IMX-';

const hasLocalStorage = () => typeof window !== 'undefined' && !!window.localStorage;

const parseItem = (payload: string | null) => {
  if (payload === null) return undefined;
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
};

export function getItem<T = unknown>(key: string): T | undefined {
  if (!hasLocalStorage()) {
    return undefined;
  }
  return parseItem(window.localStorage.getItem(`${PREFIX}${key}`)) as T | undefined;
}

export const setItem = (key: string, payload: unknown): boolean => {
  if (!hasLocalStorage()) {
    return false;
  }
  const value = typeof payload === 'string' ? payload : JSON.stringify(payload);
  window.localStorage.setItem(`${PREFIX}${key}`, value);
  return true;
};
