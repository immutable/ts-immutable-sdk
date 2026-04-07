import {
  getOrCreateSessionId,
  renewSession,
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

describe('renewSession', () => {
  it('preserves existing session cookie', () => {
    const { sessionId } = getOrCreateSessionId();
    renewSession();
    expect(getOrCreateSessionId().sessionId).toBe(sessionId);
  });
});
