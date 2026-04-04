import {
  getCookie,
  setCookie,
  deleteCookie,
  getOrCreateAnonymousId,
  getOrCreateSessionId,
  touchSession,
  getConsentCookie,
  setConsentCookie,
  ANON_ID_COOKIE,
  SESSION_COOKIE,
} from './cookie';

beforeEach(() => {
  document.cookie.split(';').forEach((c) => {
    document.cookie = `${c.trim().split('=')[0]}=;max-age=0;path=/`;
  });
});

describe('getCookie / setCookie', () => {
  it('sets and reads a cookie', () => {
    setCookie('test_key', 'test_value', 3600);
    expect(getCookie('test_key')).toBe('test_value');
  });

  it('returns undefined for missing cookie', () => {
    expect(getCookie('nonexistent')).toBeUndefined();
  });

  it('handles special characters in values', () => {
    setCookie('encoded', 'hello world&foo=bar', 3600);
    expect(getCookie('encoded')).toBe('hello world&foo=bar');
  });
});

describe('deleteCookie', () => {
  it('removes a cookie', () => {
    setCookie('to_delete', 'value', 3600);
    expect(getCookie('to_delete')).toBe('value');
    deleteCookie('to_delete');
    expect(getCookie('to_delete')).toBeUndefined();
  });
});

describe('getOrCreateAnonymousId', () => {
  it('creates a new anonymous ID on first call', () => {
    const id = getOrCreateAnonymousId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(getCookie(ANON_ID_COOKIE)).toBe(id);
  });

  it('returns the same ID on subsequent calls', () => {
    const first = getOrCreateAnonymousId();
    const second = getOrCreateAnonymousId();
    expect(second).toBe(first);
  });
});

describe('getOrCreateSessionId', () => {
  it('creates a new session ID', () => {
    const sid = getOrCreateSessionId();
    expect(sid).toBeDefined();
    expect(getCookie(SESSION_COOKIE)).toBe(sid);
  });

  it('returns the same session ID within the session', () => {
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();
    expect(second).toBe(first);
  });
});

describe('touchSession', () => {
  it('does nothing if no session exists', () => {
    touchSession();
    expect(getCookie(SESSION_COOKIE)).toBeUndefined();
  });

  it('preserves existing session cookie', () => {
    const sid = getOrCreateSessionId();
    touchSession();
    expect(getCookie(SESSION_COOKIE)).toBe(sid);
  });
});

describe('consent cookie', () => {
  it('sets and reads consent level', () => {
    setConsentCookie('full');
    expect(getConsentCookie()).toBe('full');
  });

  it('returns undefined when not set', () => {
    expect(getConsentCookie()).toBeUndefined();
  });
});
