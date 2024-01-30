/**
 * Abstraction on localstorage
 */

import { isBrowser } from './browser';

const localStoragePrefix = '__IMX-';

const hasLocalstorage = () => isBrowser() && window.localStorage;

const parseItem = (payload: string | null) => {
  // Try to parse, if can't be parsed assume string
  // and return string
  if (payload === null) return undefined;

  try {
    return JSON.parse(payload);
  } catch (error) {
    // Assumes it's a string.
    return payload;
  }
};

const serialiseItem = (payload: any) => {
  if (typeof payload === 'string') {
    return payload;
  }
  return JSON.stringify(payload);
};

/**
 * GenKey will take into account the namespace
 * as well as if being run in the Link, it will tap into the link
 * @param {string} key
 * @returns key
 */
const genKey = (key: string) => `${localStoragePrefix}${key}`;

export function getItem<T = any>(key: string): T | undefined {
  if (hasLocalstorage()) {
    return parseItem(window.localStorage.getItem(genKey(key))) as T;
  }
  return undefined;
}

export const setItem = (key: string, payload: any): boolean => {
  if (hasLocalstorage()) {
    window.localStorage.setItem(genKey(key), serialiseItem(payload));
    return true;
  }
  return false;
};

export const deleteItem = (key: string): boolean => {
  if (hasLocalstorage()) {
    window.localStorage.removeItem(genKey(key));
    return true;
  }
  return false;
};
