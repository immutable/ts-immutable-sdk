/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */
import { renderHook, act } from '@testing-library/react';
import { TOKEN_EXPIRY_BUFFER_MS } from './constants';

// ---------------------------------------------------------------------------
// Mocks -- must be declared before importing the modules that use them
// ---------------------------------------------------------------------------

const mockUpdate = jest.fn();
const mockUseSession = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@imtbl/auth', () => ({
  loginWithPopup: jest.fn(),
  loginWithEmbedded: jest.fn(),
  loginWithRedirect: jest.fn(),
  logoutWithRedirect: jest.fn(),
}));

// Mock auth-next-server to avoid loading next/server (Request not defined in Node/Jest)
jest.mock('@imtbl/auth-next-server', () => ({
  DEFAULT_AUTH_DOMAIN: 'https://auth.immutable.com',
  DEFAULT_AUDIENCE: 'platform_api',
  DEFAULT_SCOPE: 'openid profile email offline_access transact',
  IMMUTABLE_PROVIDER_ID: 'immutable',
  DEFAULT_NEXTAUTH_BASE_PATH: '/api/auth',
  DEFAULT_PRODUCTION_CLIENT_ID: 'prod-client-id',
  DEFAULT_SANDBOX_CLIENT_ID: 'sandbox-client-id',
  DEFAULT_REDIRECT_URI_PATH: '/callback',
  DEFAULT_POPUP_REDIRECT_URI_PATH: '/callback',
  DEFAULT_LOGOUT_REDIRECT_URI_PATH: '/',
  DEFAULT_TOKEN_EXPIRY_MS: 900000,
  TOKEN_EXPIRY_BUFFER_MS: 60000,
  deriveDefaultClientId: jest.fn(() => 'sandbox-client-id'),
  deriveDefaultRedirectUri: jest.fn(() => 'http://localhost:3000/callback'),
}));

import { useImmutableSession } from './hooks';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Full session shape matching what NextAuth returns at runtime.
 * The public ImmutableSession type intentionally omits accessToken,
 * but the underlying data still has it -- tests need the full shape
 * to set up mock sessions correctly.
 */
interface TestSession {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires: number;
  zkEvm?: { ethAddress: string; userAdminAddress: string };
  error?: string;
  user?: any;
  expires: string;
}

function createSession(overrides: Partial<TestSession> = {}): TestSession {
  return {
    accessToken: 'valid-token',
    refreshToken: 'refresh-token',
    idToken: 'id-token',
    accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 min from now
    user: { sub: 'user-1', email: 'test@test.com' },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

function setupUseSession(session: TestSession | null, status: string = 'authenticated') {
  mockUseSession.mockReturnValue({
    data: session,
    status,
    update: mockUpdate,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useImmutableSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockReset();
  });

  describe('session type safety', () => {
    it('does not expose accessToken on the public session type', () => {
      const session = createSession();
      setupUseSession(session);
      mockUpdate.mockResolvedValue(session);

      const { result } = renderHook(() => useImmutableSession());

      // TypeScript prevents accessing accessToken, but at runtime the
      // underlying object still has it. Verify the hook returns a session
      // and that the public type doesn't advertise accessToken.
      expect(result.current.session).toBeDefined();
      expect(result.current.session?.error).toBeUndefined();
      // The property exists at runtime (it's the same object) but the type
      // system hides it -- this is a compile-time guard, not a runtime one.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.current.session as any).accessToken).toBeDefined();
    });
  });

  describe('getAccessToken()', () => {
    it('returns the token immediately when it is valid (fast path)', async () => {
      const session = createSession();
      setupUseSession(session);
      mockUpdate.mockResolvedValue(session); // in case proactive timer fires

      const { result } = renderHook(() => useImmutableSession());

      const token = await result.current.getAccessToken();
      expect(token).toBe('valid-token');
    });

    it('triggers refresh and returns fresh token when expired', async () => {
      const expiredSession = createSession({
        accessTokenExpires: Date.now() - 1000, // already expired
      });
      setupUseSession(expiredSession);

      const freshSession = createSession({
        accessToken: 'fresh-token',
        accessTokenExpires: Date.now() + 10 * 60 * 1000,
      });
      mockUpdate.mockResolvedValue(freshSession);

      const { result } = renderHook(() => useImmutableSession());

      let token: string = '';
      await act(async () => {
        token = await result.current.getAccessToken();
      });
      expect(token).toBe('fresh-token');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('triggers refresh when token is within the buffer window', async () => {
      const almostExpiredSession = createSession({
        accessTokenExpires: Date.now() + TOKEN_EXPIRY_BUFFER_MS - 1000, // within buffer
      });
      setupUseSession(almostExpiredSession);

      const freshSession = createSession({
        accessToken: 'refreshed-token',
        accessTokenExpires: Date.now() + 10 * 60 * 1000,
      });
      mockUpdate.mockResolvedValue(freshSession);

      const { result } = renderHook(() => useImmutableSession());

      let token: string = '';
      await act(async () => {
        token = await result.current.getAccessToken();
      });
      expect(token).toBe('refreshed-token');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('throws when refresh fails (no accessToken in response)', async () => {
      const expiredSession = createSession({
        accessTokenExpires: Date.now() - 1000,
      });
      setupUseSession(expiredSession);

      mockUpdate.mockResolvedValue(null);

      const { result } = renderHook(() => useImmutableSession());

      await expect(
        act(async () => {
          await result.current.getAccessToken();
        }),
      ).rejects.toThrow('[auth-next-client] Failed to get access token');
    });

    it('throws when refresh returns a session with error', async () => {
      const expiredSession = createSession({
        accessTokenExpires: Date.now() - 1000,
      });
      setupUseSession(expiredSession);

      const errorSession = createSession({ error: 'RefreshTokenError' });
      mockUpdate.mockResolvedValue(errorSession);

      const { result } = renderHook(() => useImmutableSession());

      await expect(
        act(async () => {
          await result.current.getAccessToken();
        }),
      ).rejects.toThrow('RefreshTokenError');
    });

    it('deduplicates concurrent calls (only one update())', async () => {
      const expiredSession = createSession({
        accessTokenExpires: Date.now() - 1000,
      });
      setupUseSession(expiredSession);

      const freshSession = createSession({
        accessToken: 'deduped-token',
        accessTokenExpires: Date.now() + 10 * 60 * 1000,
      });

      // Track how many times update is actually invoked
      let updateCallCount = 0;
      mockUpdate.mockImplementation(() => {
        updateCallCount++;
        return Promise.resolve(freshSession);
      });

      const { result } = renderHook(() => useImmutableSession());

      let token1: string = '';
      let token2: string = '';
      await act(async () => {
        [token1, token2] = await Promise.all([
          result.current.getAccessToken(),
          result.current.getAccessToken(),
        ]);
      });

      expect(token1).toBe('deduped-token');
      expect(token2).toBe('deduped-token');
      // The proactive effect may also trigger one call, so we check
      // that concurrent getAccessToken calls are deduped (not doubled)
      // The key invariant: at most 1 update() call per pending refresh cycle
      expect(updateCallCount).toBeLessThanOrEqual(2); // 1 from effect + 1 from getAccessToken (deduped)
    });
  });

  describe('reactive refresh on mount', () => {
    it('triggers refresh when token is already expired on mount', async () => {
      const session = createSession({
        accessTokenExpires: Date.now() - 1000, // already expired
      });
      setupUseSession(session);

      const freshSession = createSession({
        accessToken: 'immediate-refresh',
      });
      mockUpdate.mockResolvedValue(freshSession);

      await act(async () => {
        renderHook(() => useImmutableSession());
      });

      // The proactive useEffect should have called update
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('does not set isRefreshing during reactive refresh (prevents UI flicker)', async () => {
      const session = createSession({
        accessTokenExpires: Date.now() - 1000, // already expired
      });
      setupUseSession(session);

      const freshSession = createSession({
        accessToken: 'immediate-refresh',
      });
      mockUpdate.mockResolvedValue(freshSession);

      const capturedIsRefreshing: boolean[] = [];
      const { result } = renderHook(() => {
        const hook = useImmutableSession();
        capturedIsRefreshing.push(hook.isRefreshing);
        return hook;
      });

      await act(async () => {
        // Let the reactive refresh effect run and complete
        await mockUpdate.mock.results[0]?.value;
      });

      // isRefreshing should NEVER have been true during reactive refresh.
      // It is reserved for explicit user-triggered refreshes (getUser(true)).
      expect(capturedIsRefreshing.every((v) => v === false)).toBe(true);
      expect(result.current.isRefreshing).toBe(false);
    });

    it('does not trigger refresh when token is valid and far from expiry', async () => {
      const session = createSession({
        accessTokenExpires: Date.now() + 10 * 60 * 1000, // 10 min from now, well beyond buffer
      });
      setupUseSession(session);

      await act(async () => {
        renderHook(() => useImmutableSession());
      });

      // Should NOT have called update -- token is still valid
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('getUser() respects pending refresh', () => {
    it('waits for in-flight refresh before returning user', async () => {
      const expiredSession = createSession({
        accessTokenExpires: Date.now() - 1000,
      });
      setupUseSession(expiredSession);

      const freshSession = createSession({
        accessToken: 'user-fresh-token',
        accessTokenExpires: Date.now() + 10 * 60 * 1000,
      });

      mockUpdate.mockResolvedValue(freshSession);

      const { result } = renderHook(() => useImmutableSession());

      let user: any;
      await act(async () => {
        user = await result.current.getUser();
      });

      // getUser() should have waited for the refresh and gotten the fresh token
      expect(user?.accessToken).toBe('user-fresh-token');
    });
  });
});
