import { getOrCreateSessionId, getSessionId } from './session';

const SESSION_COOKIE_NAME = '_imtbl_sid';

// Mock audience-core cookie helpers
const mockGetCookie = jest.fn();
const mockSetCookie = jest.fn();
const mockGenerateId = jest.fn();

jest.mock('@imtbl/audience-core', () => ({
  getCookie: (...args: unknown[]) => mockGetCookie(...args),
  setCookie: (...args: unknown[]) => mockSetCookie(...args),
  generateId: (...args: unknown[]) => mockGenerateId(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateId.mockReturnValue('new-session-id');
});

describe('getOrCreateSessionId', () => {
  it('creates a new session ID when no cookie exists', () => {
    mockGetCookie.mockReturnValue(undefined);

    const id = getOrCreateSessionId();
    expect(id).toBe('new-session-id');
    expect(mockSetCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, 'new-session-id', 1800, undefined);
  });

  it('returns existing session ID and refreshes expiry', () => {
    mockGetCookie.mockReturnValue('existing-sid');

    const id = getOrCreateSessionId();
    expect(id).toBe('existing-sid');
    expect(mockSetCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, 'existing-sid', 1800, undefined);
    expect(mockGenerateId).not.toHaveBeenCalled();
  });

  it('passes domain to setCookie', () => {
    mockGetCookie.mockReturnValue(undefined);

    getOrCreateSessionId('.example.com');
    expect(mockSetCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, 'new-session-id', 1800, '.example.com');
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
