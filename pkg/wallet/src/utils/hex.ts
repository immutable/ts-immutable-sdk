/**
 * Hex string utilities
 * Simple helpers for hex manipulation (viem handles most conversions)
 */

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
