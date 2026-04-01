import { isBrowser, generateId, getTimestamp } from './utils';

describe('isBrowser', () => {
  it('returns true in jsdom', () => {
    expect(isBrowser()).toBe(true);
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('getTimestamp', () => {
  it('returns an ISO 8601 string', () => {
    const ts = getTimestamp();
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});
