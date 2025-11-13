/**
 * Hex string utilities
 * Simple helpers for hex manipulation (viem handles most conversions)
 */

import { hexToString as viemHexToString } from 'viem';

/**
 * Removes 0x prefix from hex string if present
 * Used for manual hex string manipulation (e.g., Sequence encoding)
 */
export function removeHexPrefix(hex: string): string {
  return hex.startsWith('0x') ? hex.slice(2) : hex;
}

/**
 * Cleans an address (removes prefix, lowercases)
 * Used for Sequence signature encoding
 */
export function cleanAddress(addr: string): string {
  return removeHexPrefix(addr).toLowerCase();
}

/**
 * Cleans a signature (removes prefix, validates length)
 * Used for Sequence signature encoding
 */
export function cleanSignature(sig: string, expectedLength?: number): string {
  const cleaned = removeHexPrefix(sig);
  if (expectedLength && cleaned.length !== expectedLength) {
    throw new Error(`Invalid signature length: expected ${expectedLength} hex chars, got ${cleaned.length}`);
  }
  return cleaned;
}

/**
 * Converts hex string to string
 * Uses viem's hexToString directly - viem handles hex validation
 * Note: personal_sign messages are typically already strings or properly formatted hex
 */
export function hexToString(hex: string): string {
  // If not hex, return as-is (might already be a string)
  if (!hex.startsWith('0x')) {
    return hex;
  }
  
  try {
    return viemHexToString(hex as `0x${string}`);
  } catch {
    // If viem can't decode (invalid UTF-8), return hex as-is
    return hex;
  }
}

