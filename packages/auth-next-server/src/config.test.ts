/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/first */

jest.mock('next-auth/providers/credentials', () => jest.fn((options: unknown) => options));
jest.mock('next-auth/jwt', () => ({ encode: jest.fn() }));

import { createAuthConfig } from './config';

const jwt = createAuthConfig({
  clientId: 'client',
  redirectUri: 'http://localhost:3000/callback',
}).callbacks!.jwt as (params: any) => Promise<any>;

// An access token past its expiry, so the jwt callback tries to refresh.
const expiredToken = {
  sub: 'user',
  accessToken: 'old-access',
  refreshToken: 'old-refresh',
  accessTokenExpires: Date.now() - 60_000,
};

function mockTokenEndpoint(status: number, body: unknown) {
  return jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), { status }),
  );
}

describe('jwt callback refresh failures', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('drops a rejected refresh token so it is not sent again', async () => {
    const fetchMock = mockTokenEndpoint(400, { error: 'invalid_grant' });

    const failed = await jwt({ token: expiredToken });

    expect(failed.error).toBe('RefreshTokenError');
    expect(failed.refreshToken).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Every later session read: no token endpoint call, error stays RefreshTokenError.
    const again = await jwt({ token: failed });
    const third = await jwt({ token: again });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(third.error).toBe('RefreshTokenError');
  });

  it('treats an Auth0 403 invalid_grant the same way', async () => {
    mockTokenEndpoint(403, { error: 'invalid_grant', error_description: 'Unknown or invalid refresh token.' });

    const failed = await jwt({ token: expiredToken });

    expect(failed.error).toBe('RefreshTokenError');
    expect(failed.refreshToken).toBeUndefined();
  });

  it('keeps the refresh token after a transient failure and retries on the next read', async () => {
    const fetchMock = mockTokenEndpoint(503, { error: 'temporarily_unavailable' });

    const failed = await jwt({ token: expiredToken });

    expect(failed.error).toBe('RefreshTokenError');
    expect(failed.refreshToken).toBe('old-refresh');

    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
    }), { status: 200 }));

    const recovered = await jwt({ token: failed });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(recovered.error).toBeUndefined();
    expect(recovered.accessToken).toBe('new-access');
    expect(recovered.refreshToken).toBe('new-refresh');
  });

  it('keeps the refresh token after a network error', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('fetch failed'));

    const failed = await jwt({ token: expiredToken });

    expect(failed.error).toBe('RefreshTokenError');
    expect(failed.refreshToken).toBe('old-refresh');
  });

  it('drops a rejected refresh token on forceRefresh too', async () => {
    mockTokenEndpoint(400, { error: 'invalid_grant' });

    const failed = await jwt({
      token: { ...expiredToken, accessTokenExpires: Date.now() + 600_000 },
      trigger: 'update',
      session: { forceRefresh: true },
    });

    expect(failed.error).toBe('RefreshTokenError');
    expect(failed.refreshToken).toBeUndefined();
  });

  it('still reports TokenExpired when a session never had a refresh token', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');

    const result = await jwt({ token: { ...expiredToken, refreshToken: undefined } });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.error).toBe('TokenExpired');
  });
});
