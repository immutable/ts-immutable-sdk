import {
  isTimestampValid,
  isAliasValid,
  truncate,
  truncateSource,
} from './validation';

describe('isTimestampValid', () => {
  it('accepts a current timestamp', () => {
    expect(isTimestampValid(new Date().toISOString())).toBe(true);
  });

  it('accepts a timestamp 23 hours in the future', () => {
    const future = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString();
    expect(isTimestampValid(future)).toBe(true);
  });

  it('rejects a timestamp 25 hours in the future', () => {
    const future = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();
    expect(isTimestampValid(future)).toBe(false);
  });

  it('accepts a timestamp 29 days in the past', () => {
    const past = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
    expect(isTimestampValid(past)).toBe(true);
  });

  it('rejects a timestamp 31 days in the past', () => {
    const past = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    expect(isTimestampValid(past)).toBe(false);
  });

  it('rejects an invalid date string', () => {
    expect(isTimestampValid('not-a-date')).toBe(false);
  });
});

describe('isAliasValid', () => {
  it('returns true when from and to differ', () => {
    expect(isAliasValid('steam_123', 'steam', 'user@example.com', 'email')).toBe(true);
  });

  it('returns true when same ID but different type', () => {
    expect(isAliasValid('123', 'steam', '123', 'email')).toBe(true);
  });

  it('returns false when from and to are identical', () => {
    expect(isAliasValid('user@example.com', 'email', 'user@example.com', 'email')).toBe(false);
  });
});

describe('truncate', () => {
  it('returns the original string when within the limit', () => {
    expect(truncate('hello', 256)).toBe('hello');
  });

  it('truncates to the default max length of 256', () => {
    const long = 'x'.repeat(300);
    expect(truncate(long)).toHaveLength(256);
  });

  it('truncates to a custom max length', () => {
    expect(truncate('hello world', 5)).toBe('hello');
  });
});

describe('truncateSource', () => {
  it('truncates to the consent source max length of 128', () => {
    const long = 'x'.repeat(200);
    expect(truncateSource(long)).toHaveLength(128);
  });

  it('returns the original when within 128 chars', () => {
    expect(truncateSource('CookieBannerV2')).toBe('CookieBannerV2');
  });
});
