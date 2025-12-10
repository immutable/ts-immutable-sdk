/* eslint-disable no-restricted-globals */
const getGlobal = (): typeof globalThis => {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  return {} as typeof globalThis;
};

const base64UrlToBase64 = (input: string): string => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return normalized + padding;
};

const decodeWithAtob = (value: string): string | null => {
  const globalRef = getGlobal();
  if (typeof globalRef.atob !== 'function') {
    return null;
  }

  const binary = globalRef.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  if (typeof globalRef.TextDecoder === 'function') {
    return new globalRef.TextDecoder('utf-8').decode(bytes);
  }

  let result = '';
  for (let i = 0; i < bytes.length; i += 1) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
};

const base64Decode = (value: string): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64').toString('utf-8');
  }

  const decoded = decodeWithAtob(value);
  if (decoded === null) {
    throw new Error('Base64 decoding is not supported in this environment');
  }

  return decoded;
};

export const decodeJwtPayload = <T>(token: string): T => {
  if (typeof token !== 'string') {
    throw new Error('JWT must be a string');
  }

  const segments = token.split('.');
  if (segments.length < 2) {
    throw new Error('Invalid JWT: payload segment is missing');
  }

  const payloadSegment = segments[1];
  const json = base64Decode(base64UrlToBase64(payloadSegment));

  try {
    return JSON.parse(json) as T;
  } catch {
    throw new Error('Invalid JWT payload: unable to parse JSON');
  }
};
