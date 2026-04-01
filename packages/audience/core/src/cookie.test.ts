import { getOrCreateAnonymousId, getAnonymousId } from './cookie';
import { COOKIE_NAME } from './config';

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim();
    document.cookie = `${name}=; max-age=0; path=/`;
  });
}

beforeEach(clearCookies);

describe('getOrCreateAnonymousId', () => {
  it('generates a new ID when no cookie exists', () => {
    const id = getOrCreateAnonymousId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('persists the ID in a cookie', () => {
    const id = getOrCreateAnonymousId();
    expect(document.cookie).toContain(`${COOKIE_NAME}=${id}`);
  });

  it('returns the same ID on subsequent calls', () => {
    const first = getOrCreateAnonymousId();
    const second = getOrCreateAnonymousId();
    expect(second).toBe(first);
  });

  it('returns an existing cookie value if already set', () => {
    document.cookie = `${COOKIE_NAME}=existing-id; path=/`;
    expect(getOrCreateAnonymousId()).toBe('existing-id');
  });
});

describe('getAnonymousId', () => {
  it('returns undefined when no cookie exists', () => {
    expect(getAnonymousId()).toBeUndefined();
  });

  it('returns the cookie value when set', () => {
    document.cookie = `${COOKIE_NAME}=test-id; path=/`;
    expect(getAnonymousId()).toBe('test-id');
  });
});
