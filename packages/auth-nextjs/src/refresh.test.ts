import type { JWT } from 'next-auth/jwt';
import { refreshAccessToken, isTokenExpired } from './refresh';
import type { ImmutableAuthConfig } from './types';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper to create a mock JWT token
const createMockToken = (overrides: Partial<JWT> = {}): JWT => ({
  sub: 'user-123',
  email: 'test@example.com',
  accessToken: 'old-access-token',
  refreshToken: 'valid-refresh-token',
  idToken: 'old-id-token',
  accessTokenExpires: Date.now() - 1000, // expired
  ...overrides,
});

// Mock config
const mockConfig: ImmutableAuthConfig = {
  clientId: 'test-client-id',
  redirectUri: 'http://localhost:3000/callback',
};

// Helper to create a successful refresh response
const createSuccessResponse = (delay = 0) => {
  const responseData = {
    access_token: 'new-access-token',
    refresh_token: 'new-refresh-token',
    id_token: 'new-id-token',
    expires_in: 900,
  };

  return new Promise<Response>((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: async () => responseData,
      } as Response);
    }, delay);
  });
};

// Helper to create a 403 error response
const createErrorResponse = (delay = 0) => new Promise<Response>((resolve) => {
  setTimeout(() => {
    resolve({
      ok: false,
      status: 403,
      json: async () => ({
        error: 'invalid_grant',
        error_description: 'Unknown or invalid refresh token.',
      }),
    } as Response);
  }, delay);
});

describe('refreshAccessToken', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('should successfully refresh a token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          id_token: 'new-id-token',
          expires_in: 900,
        }),
      });

      const token = createMockToken();
      const result = await refreshAccessToken(token, mockConfig);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.idToken).toBe('new-id-token');
      expect(result.error).toBeUndefined();
    });

    it('should return NoRefreshToken error when refresh token is missing', async () => {
      const token = createMockToken({ refreshToken: undefined });
      const result = await refreshAccessToken(token, mockConfig);

      expect(result.error).toBe('NoRefreshToken');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return RefreshTokenError on 403 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Unknown or invalid refresh token.',
        }),
      });

      const token = createMockToken();
      const result = await refreshAccessToken(token, mockConfig);

      expect(result.error).toBe('RefreshTokenError');
    });
  });

  describe('race condition prevention (deduplication)', () => {
    it('should deduplicate concurrent refresh requests for the same refresh token', async () => {
      // First call will succeed after a delay
      // This tests that concurrent requests share the same refresh result
      mockFetch.mockImplementation(() => createSuccessResponse(100));

      const token = createMockToken();

      // Simulate multiple concurrent auth() calls that all detect expired token
      const [result1, result2, result3] = await Promise.all([
        refreshAccessToken(token, mockConfig),
        refreshAccessToken(token, mockConfig),
        refreshAccessToken(token, mockConfig),
      ]);

      // All should get the same successful result
      expect(result1.accessToken).toBe('new-access-token');
      expect(result2.accessToken).toBe('new-access-token');
      expect(result3.accessToken).toBe('new-access-token');

      // CRITICAL: Only ONE fetch call should have been made
      // This prevents the race condition where multiple requests use the same
      // refresh token and get 403 errors due to token rotation
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should allow new refresh after previous one completes', async () => {
      mockFetch
        .mockImplementationOnce(() => createSuccessResponse(10))
        .mockImplementationOnce(() => createSuccessResponse(10));

      const token1 = createMockToken({ refreshToken: 'refresh-token-1' });
      const token2 = createMockToken({ refreshToken: 'refresh-token-2' });

      // First refresh
      await refreshAccessToken(token1, mockConfig);

      // Second refresh with different token (simulating rotated token)
      await refreshAccessToken(token2, mockConfig);

      // Both should have triggered separate fetch calls since they're sequential
      // and use different refresh tokens
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent requests with different refresh tokens independently', async () => {
      mockFetch.mockImplementation(() => createSuccessResponse(50));

      const token1 = createMockToken({ refreshToken: 'refresh-token-A' });
      const token2 = createMockToken({ refreshToken: 'refresh-token-B' });

      // Two concurrent requests with DIFFERENT refresh tokens
      await Promise.all([
        refreshAccessToken(token1, mockConfig),
        refreshAccessToken(token2, mockConfig),
      ]);

      // Each should trigger its own fetch call since they have different refresh tokens
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should propagate errors to all waiting requests', async () => {
      mockFetch.mockImplementation(() => createErrorResponse(50));

      const token = createMockToken();

      // Multiple concurrent requests
      const [result1, result2, result3] = await Promise.all([
        refreshAccessToken(token, mockConfig),
        refreshAccessToken(token, mockConfig),
        refreshAccessToken(token, mockConfig),
      ]);

      // All should get the error
      expect(result1.error).toBe('RefreshTokenError');
      expect(result2.error).toBe('RefreshTokenError');
      expect(result3.error).toBe('RefreshTokenError');

      // But only ONE fetch call should have been made
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should allow retry after failed refresh completes', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockImplementationOnce(() => createErrorResponse(10))
        .mockImplementationOnce(() => createSuccessResponse(10));

      const token = createMockToken();

      // First refresh fails
      const result1 = await refreshAccessToken(token, mockConfig);
      expect(result1.error).toBe('RefreshTokenError');

      // Retry should work (new fetch call)
      const result2 = await refreshAccessToken(token, mockConfig);
      expect(result2.accessToken).toBe('new-access-token');

      // Two separate fetch calls
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('isTokenExpired', () => {
  it('should return true for expired tokens', () => {
    const expiredTime = Date.now() - 1000;
    expect(isTokenExpired(expiredTime)).toBe(true);
  });

  it('should return true for tokens expiring within buffer', () => {
    const almostExpired = Date.now() + 30 * 1000; // 30 seconds from now
    expect(isTokenExpired(almostExpired, 60)).toBe(true); // 60 second buffer
  });

  it('should return false for valid tokens outside buffer', () => {
    const validTime = Date.now() + 120 * 1000; // 2 minutes from now
    expect(isTokenExpired(validTime, 60)).toBe(false);
  });

  it('should return true for NaN', () => {
    expect(isTokenExpired(NaN)).toBe(true);
  });

  it('should return true for undefined/invalid values', () => {
    expect(isTokenExpired(undefined as unknown as number)).toBe(true);
    expect(isTokenExpired(null as unknown as number)).toBe(true);
  });
});
