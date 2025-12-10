import { toBytes, type Hex } from 'viem';

/**
 * Strip leading zero bytes from a Uint8Array
 */
const stripZerosLeft = (bytes: Uint8Array): Uint8Array => {
  let start = 0;
  while (start < bytes.length && bytes[start] === 0) {
    start++;
  }
  return bytes.slice(start);
};

/**
 * Convert UTF-8 bytes to string
 */
const toUtf8String = (bytes: Uint8Array): string => {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }

  // Fallback for environments without TextDecoder
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return decodeURIComponent(escape(result));
};

export const hexToString = (hex: string) => {
  if (!hex) return hex;

  try {
    const bytes = toBytes(hex as Hex);
    const stripped = stripZerosLeft(bytes);
    return toUtf8String(stripped);
  } catch (e) {
    return hex;
  }
};
