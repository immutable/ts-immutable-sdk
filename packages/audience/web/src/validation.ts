const MAX_FUTURE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_PAST_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Validate that an event timestamp is within the backend's accepted range:
 * no more than 24 hours in the future, no more than 30 days in the past.
 * Returns true if valid.
 */
export function isTimestampValid(eventTimestamp: string): boolean {
  const ts = new Date(eventTimestamp).getTime();
  if (Number.isNaN(ts)) return false;
  const now = Date.now();
  return ts <= now + MAX_FUTURE_MS && ts >= now - MAX_PAST_MS;
}

/**
 * Validate that alias from and to are not the same identity.
 * Returns true if valid (they differ).
 */
export function isAliasValid(fromUid: string, fromProvider: string, toUid: string, toProvider: string): boolean {
  return fromUid !== toUid || fromProvider !== toProvider;
}
