import {
  isTimestampValid,
  isAliasValid,
  isPassportIdValid,
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

describe('isPassportIdValid', () => {
  it('accepts a connection|id shaped ID', () => {
    expect(isPassportIdValid('email|abc123')).toBe(true);
  });

  it('accepts a google-oauth2 connection ID', () => {
    expect(isPassportIdValid('google-oauth2|11261203362550278288455')).toBe(true);
  });

  it('accepts a bare UUID', () => {
    expect(isPassportIdValid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('rejects an ID with no pipe and not a UUID', () => {
    expect(isPassportIdValid('12345')).toBe(false);
  });

  it('rejects an ID with more than one pipe', () => {
    expect(isPassportIdValid('email|abc|123')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isPassportIdValid('')).toBe(false);
  });

  it('accepts a UUID with surrounding whitespace, e.g. from a trailing newline in a text field', () => {
    expect(isPassportIdValid(' 550e8400-e29b-41d4-a716-446655440000\n')).toBe(true);
  });

  it('does not let surrounding whitespace alone turn an invalid ID into a valid one', () => {
    expect(isPassportIdValid('  12345  ')).toBe(false);
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
