import { getBaseUrl } from './config';

describe('getBaseUrl', () => {
  it('returns dev URL', () => {
    expect(getBaseUrl('dev')).toBe('https://api.dev.immutable.com');
  });

  it('returns sandbox URL', () => {
    expect(getBaseUrl('sandbox')).toBe('https://api.sandbox.immutable.com');
  });

  it('returns production URL', () => {
    expect(getBaseUrl('production')).toBe('https://api.immutable.com');
  });
});
