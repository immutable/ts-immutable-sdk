import { getStorageAdapter, type StorageAdapter } from './storage';

const ANONYMOUS_ID_KEY = '__imtbl_attribution_anonymous_id__';
const USER_ID_KEY = '__imtbl_attribution_user_id__';
const USER_EMAIL_KEY = '__imtbl_attribution_user_email__';
const OPT_OUT_KEY = '__imtbl_attribution_opt_out__';

/**
 * Generate a random anonymous ID
 */
function generateAnonymousId(): string {
  // Generate a UUID v4-like ID
  const chars = '0123456789abcdef';
  const segments = [8, 4, 4, 4, 12];
  const id = segments
    .map((len) => {
      let segment = '';
      for (let i = 0; i < len; i++) {
        segment += chars[Math.floor(Math.random() * 16)];
      }
      return segment;
    })
    .join('-');

  return id;
}

/**
 * Get or create anonymous ID
 */
export function getAnonymousId(storage: StorageAdapter): string {
  let anonymousId = storage.getItem(ANONYMOUS_ID_KEY);

  if (!anonymousId) {
    anonymousId = generateAnonymousId();
    storage.setItem(ANONYMOUS_ID_KEY, anonymousId);
  }

  return anonymousId;
}

/**
 * Reset anonymous ID (generates new one)
 */
export function resetAnonymousId(storage: StorageAdapter): string {
  const newId = generateAnonymousId();
  storage.setItem(ANONYMOUS_ID_KEY, newId);
  return newId;
}

/**
 * Set user ID
 */
export function setUserId(storage: StorageAdapter, userId: string | null): void {
  if (userId) {
    storage.setItem(USER_ID_KEY, userId);
  } else {
    storage.removeItem(USER_ID_KEY);
  }
}

/**
 * Get user ID
 */
export function getUserId(storage: StorageAdapter): string | null {
  return storage.getItem(USER_ID_KEY);
}

/**
 * Set user email
 */
export function setUserEmail(storage: StorageAdapter, email: string | null): void {
  if (email) {
    storage.setItem(USER_EMAIL_KEY, email);
  } else {
    storage.removeItem(USER_EMAIL_KEY);
  }
}

/**
 * Get user email
 */
export function getUserEmail(storage: StorageAdapter): string | null {
  return storage.getItem(USER_EMAIL_KEY);
}

/**
 * Set opt-out status (GDPR compliance)
 */
export function setOptOut(storage: StorageAdapter, optedOut: boolean): void {
  if (optedOut) {
    storage.setItem(OPT_OUT_KEY, 'true');
  } else {
    storage.removeItem(OPT_OUT_KEY);
  }
}

/**
 * Get opt-out status (GDPR compliance)
 */
export function isOptedOut(storage: StorageAdapter): boolean {
  return storage.getItem(OPT_OUT_KEY) === 'true';
}

