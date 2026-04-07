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

/**
 * Validate that alias from and to are not the same identity.
 */
export function isAliasValid(
  fromId: string,
  fromType: string,
  toId: string,
  toType: string,
): boolean {
  return fromId !== toId || fromType !== toType;
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
