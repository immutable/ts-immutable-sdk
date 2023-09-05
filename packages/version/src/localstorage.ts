/**
 * Abstraction on localstorage
 */

const localStoragePrefix = '__IMX-';

const hasLocalstorage = () => typeof window !== 'undefined' && window.localStorage;

const parseItem = (payload: string | null) => {
  // Try to parse, if can't be parsed assume string
  // and return string
  if (!payload) return undefined;

  try {
    return JSON.parse(payload);
  } catch (error) {
    return payload;
  }
};

/**
 * Link stores it's origin caller in localstorage.
 * We reference this for namespacing.
 * See: https://github.com/immutable/imx-link/blob/390c5dd37294e2b217136e4ce7e3f93030da80db/src/lib/useStoreLinkOrigin.ts#L5
 */
export const LINK_ORIGIN_STORAGE_KEY = 'linkOrigin';
let linkOrigin = '';
const getLinkOrigin = () => {
  if (linkOrigin || !hasLocalstorage()) return linkOrigin;
  linkOrigin = localStorage.getItem(LINK_ORIGIN_STORAGE_KEY) || '';
  return linkOrigin;
};

/**
 * GenKey will take into account the namespace
 * as well as if being run in the Link, it will tap into the link
 * @param key
 * @returns
 */
const genKey = (key: string) => {
  const domainString = getLinkOrigin() ? `${getLinkOrigin()}-` : '';
  return `${localStoragePrefix}${domainString}${key}`;
};

export const getItem = (key: string): any => {
  if (hasLocalstorage()) {
    return parseItem(window.localStorage.getItem(genKey(key)));
  }
  return undefined;
};

const serialiseItem = (payload: any) => {
  if (typeof payload === 'string') {
    return payload;
  }
  return JSON.stringify(payload);
};

export const setItem = (key: string, payload: any): void => {
  if (hasLocalstorage()) {
    window.localStorage.setItem(genKey(key), serialiseItem(payload));
  }
};
export const deleteItem = (key: string): void => {
  if (hasLocalstorage()) {
    window.localStorage.removeItem(genKey(key));
  }
};
