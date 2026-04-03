import { getSessionId, resetSession } from './session';
import { SESSION_TIMEOUT_MS } from './config';

afterEach(() => {
  resetSession();
  jest.restoreAllMocks();
});

describe('session', () => {
  it('returns a session ID', () => {
    const id = getSessionId();
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns the same session ID within the timeout window', () => {
    const id1 = getSessionId();
    const id2 = getSessionId();
    expect(id2).toBe(id1);
  });

  it('generates a new session ID after timeout expires', () => {
    const id1 = getSessionId();

    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + SESSION_TIMEOUT_MS + 1);

    const id2 = getSessionId();
    expect(id2).not.toBe(id1);
  });

  it('refreshes the timeout on each call (rolling window)', () => {
    const baseTime = Date.now();
    const nowSpy = jest.spyOn(Date, 'now');

    nowSpy.mockReturnValue(baseTime);
    const id1 = getSessionId();

    // 20 minutes later — still within window
    nowSpy.mockReturnValue(baseTime + 20 * 60 * 1_000);
    const id2 = getSessionId();
    expect(id2).toBe(id1);

    // Another 20 minutes (40 min total, but only 20 since last activity)
    nowSpy.mockReturnValue(baseTime + 40 * 60 * 1_000);
    const id3 = getSessionId();
    expect(id3).toBe(id1);

    // 31 minutes after last activity → new session
    nowSpy.mockReturnValue(baseTime + 40 * 60 * 1_000 + SESSION_TIMEOUT_MS + 1);
    const id4 = getSessionId();
    expect(id4).not.toBe(id1);
  });

  it('resetSession forces a new session', () => {
    const id1 = getSessionId();
    resetSession();
    const id2 = getSessionId();
    expect(id2).not.toBe(id1);
  });
});
