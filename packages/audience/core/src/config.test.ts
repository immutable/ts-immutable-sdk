import { getBaseUrl } from './config';

describe('getBaseUrl', () => {
  it('returns dev URL for test keys', () => {
    expect(getBaseUrl('pk_imapik-test-local')).toBe('https://api.dev.immutable.com');
  });

  it('returns production URL for live keys', () => {
    expect(getBaseUrl('pk_imapik-abcdef123')).toBe('https://api.immutable.com');
  });

  it('returns production URL for empty key', () => {
    expect(getBaseUrl('')).toBe('https://api.immutable.com');
  });
});
