/**
 * Opaque session id that satisfies sdk-analytics' ValidateHash checksum.
 * Random per page session — not a device fingerprint and not persisted.
 */
export const generateRuntimeId = (): string => {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const hash = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const index = Number.parseInt(hash[1]!, 16);
  return `${hash}${hash[index]!}`;
};
