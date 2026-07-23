'use client';

import { useMemo } from 'react';
import stableStringify from 'fast-json-stable-stringify';

/**
 * Returns a referentially stable version of the given value.
 *
 * The reference only changes when the value's serialized representation
 * changes (deep, key-order-independent comparison via stable JSON stringify).
 *
 * Useful for wrapping values from contexts or external sources that produce
 * new object references on every read even when the data is unchanged
 * (e.g., next-auth's useSession on window focus refetch).
 */
export function useStableValue<T>(value: T): T {
  const key = stableStringify(value);
  return useMemo(() => value, [key]); // eslint-disable-line -- deps intentionally use serialized key, not value
}
