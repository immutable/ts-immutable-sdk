import { getOrCreateSession, getOrCreateSessionId, getSessionId } from './session';

const SESSION_COOKIE = '_imtbl_sid';

// Mock internal modules
const mockGetCookie = jest.fn();
const mockSetCookie = jest.fn();
const mockGenerateId = jest.fn();

jest.mock('./cookie', () => ({
  getCookie: (...args: unknown[]) => mockGetCookie(...args),
  setCookie: (...args: unknown[]) => mockSetCookie(...args),
}));

jest.mock('./utils', () => ({
  generateId: (...args: unknown[]) => mockGenerateId(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateId.mockReturnValue('new-session-id');
});

describe('getOrCreateSession', () => {
  it('creates a new session when no cookie exists', () => {
    mockGetCookie.mockReturnValue(undefined);

    const result = getOrCreateSession();
    expect(result.sessionId).toBe('new-session-id');
    expect(result.isNew).toBe(true);
    expect(mockSetCookie).toHaveBeenCalledWith(SESSION_COOKIE, 'new-session-id', 1800, undefined);
  });

  it('returns existing session and refreshes expiry', () => {
    mockGetCookie.mockReturnValue('existing-sid');

    const result = getOrCreateSession();
    expect(result.sessionId).toBe('existing-sid');
    expect(result.isNew).toBe(false);
    expect(mockSetCookie).toHaveBeenCalledWith(SESSION_COOKIE, 'existing-sid', 1800, undefined);
    expect(mockGenerateId).not.toHaveBeenCalled();
  });

  it('passes domain to setCookie', () => {
    mockGetCookie.mockReturnValue(undefined);

    getOrCreateSession('.example.com');
    expect(mockSetCookie).toHaveBeenCalledWith(SESSION_COOKIE, 'new-session-id', 1800, '.example.com');
  });
});

describe('getOrCreateSessionId', () => {
  it('returns the session ID string', () => {
    mockGetCookie.mockReturnValue(undefined);

    const id = getOrCreateSessionId();
    expect(id).toBe('new-session-id');
  });

  it('returns existing session ID', () => {
    mockGetCookie.mockReturnValue('existing-sid');
    expect(getOrCreateSessionId()).toBe('existing-sid');
  });
});

describe('getSessionId', () => {
  it('returns the session ID from cookie', () => {
    mockGetCookie.mockReturnValue('existing-sid');
    expect(getSessionId()).toBe('existing-sid');
  });

  it('returns undefined when no session cookie exists', () => {
    mockGetCookie.mockReturnValue(undefined);
    expect(getSessionId()).toBeUndefined();
  });
});
