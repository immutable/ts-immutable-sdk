import { IdentityType } from './types';

const MAX_FUTURE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_PAST_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Backend maxLength constraints from OAS
const MAX_STRING_LENGTH = 256; // anonymousId, eventName, userId, fromId, toId
const MAX_SOURCE_LENGTH = 128; // consent source

/**
 * Validate that an event timestamp is within the backend's accepted range:
 * no more than 24 hours in the future, no more than 30 days in the past.
 */
export function isTimestampValid(eventTimestamp: string): boolean {
  const ts = new Date(eventTimestamp).getTime();
  if (Number.isNaN(ts)) return false;
  const now = Date.now();
  return ts <= now + MAX_FUTURE_MS && ts >= now - MAX_PAST_MS;
}

const PASSPORT_ID_RE = /^[^|]+\|[^|]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate that an ID looks like a Passport ID: either `<connection>|<id>`
 * (e.g. `email|abc123`, `google-oauth2|456`) or a bare UUID.
 */
export function isPassportIdValid(id: string): boolean {
  const trimmed = id.trim();
  return PASSPORT_ID_RE.test(trimmed) || UUID_RE.test(trimmed);
}

/**
 * Validate that alias from and to are not the same identity. Matches the
 * backend: only the ids are compared, identityType is not a factor.
 */
export function isAliasValid(fromId: string, toId: string): boolean {
  return fromId !== toId;
}

const CONSENT_LEVELS: ReadonlySet<string> = new Set(['none', 'anonymous', 'full']);
const IDENTITY_TYPES: ReadonlySet<string> = new Set(Object.values(IdentityType));

/** Validate that a consent level is one the backend recognises. */
export function isValidConsentLevel(value: string): boolean {
  return CONSENT_LEVELS.has(value);
}

/** Validate that an identity type is one the backend recognises. */
export function isValidIdentityType(value: string): boolean {
  return IDENTITY_TYPES.has(value);
}

/**
 * Matches the backend's MISSING_REQUIRED_FIELD check: empty or
 * whitespace-only counts as missing.
 */
export function hasValue(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Truncate a string to the backend's max length for the given field.
 * Returns the original string if within limits.
 */
export function truncate(value: string, maxLength = MAX_STRING_LENGTH): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

export function truncateSource(value: string): string {
  return truncate(value, MAX_SOURCE_LENGTH);
}
