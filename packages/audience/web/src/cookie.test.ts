import {
  getOrCreateSessionId,
  getSessionId,
  touchSession,
  getConsentCookie,
  setConsentCookie,
} from './cookie';

beforeEach(() => {
  document.cookie.split(';').forEach((c) => {
    document.cookie = `${c.trim().split('=')[0]}=; max-age=0; path=/`;
  });
});

describe('getOrCreateSessionId', () => {
  it('creates a new session ID and reports isNew', () => {
    const result = getOrCreateSessionId();
    expect(result.sessionId).toBeDefined();
    expect(typeof result.sessionId).toBe('string');
    expect(result.isNew).toBe(true);
  });

  it('returns existing session and isNew=false', () => {
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();
    expect(second.sessionId).toBe(first.sessionId);
    expect(second.isNew).toBe(false);
  });
});

describe('getSessionId', () => {
  it('returns undefined when no session exists', () => {
    expect(getSessionId()).toBeUndefined();
  });

  it('returns session ID after creation', () => {
    const { sessionId } = getOrCreateSessionId();
    expect(getSessionId()).toBe(sessionId);
  });
});

describe('touchSession', () => {
  it('does nothing if no session exists', () => {
    touchSession();
    expect(getSessionId()).toBeUndefined();
  });

  it('preserves existing session cookie', () => {
    const { sessionId } = getOrCreateSessionId();
    touchSession();
    expect(getOrCreateSessionId().sessionId).toBe(sessionId);
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
