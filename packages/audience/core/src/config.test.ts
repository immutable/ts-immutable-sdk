import { getBaseUrl } from './config';

describe('getBaseUrl', () => {
  it('returns sandbox URL for test keys', () => {
    expect(getBaseUrl('pk_imapik-test-local')).toBe('https://api.sandbox.immutable.com');
  });

  it('returns production URL for live keys', () => {
    expect(getBaseUrl('pk_imapik-abcdef123')).toBe('https://api.immutable.com');
  });

  it('returns production URL for empty key', () => {
    expect(getBaseUrl('')).toBe('https://api.immutable.com');
  });

  it('uses baseUrl override when provided', () => {
    expect(getBaseUrl('pk_imapik-test-local', 'https://api.dev.immutable.com'))
      .toBe('https://api.dev.immutable.com');
  });

  it('uses baseUrl override even for production keys', () => {
    expect(getBaseUrl('pk_imapik-abcdef123', 'https://custom.example.com'))
      .toBe('https://custom.example.com');
  });
});
