import {
  isTerminalRefreshError,
  refreshAccessToken,
  RefreshTokenRequestError,
} from './refresh';

function mockTokenEndpoint(status: number, body: string) {
  return jest.spyOn(global, 'fetch').mockResolvedValue(new Response(body, { status }));
}

describe('refreshAccessToken', () => {
  it('throws RefreshTokenRequestError with the status and OAuth error code', async () => {
    mockTokenEndpoint(400, JSON.stringify({
      error: 'invalid_grant',
      error_description: 'The refresh token can not be found.',
    }));

    const error = await refreshAccessToken('rt', 'client').catch((e) => e);

    expect(error).toBeInstanceOf(RefreshTokenRequestError);
    expect(error.message).toBe('The refresh token can not be found.');
    expect(error.status).toBe(400);
    expect(error.oauthError).toBe('invalid_grant');
  });

  it('leaves oauthError unset when the body is not JSON', async () => {
    mockTokenEndpoint(502, 'Bad Gateway');

    const error = await refreshAccessToken('rt', 'client').catch((e) => e);

    expect(error).toBeInstanceOf(RefreshTokenRequestError);
    expect(error.message).toBe('Bad Gateway');
    expect(error.status).toBe(502);
    expect(error.oauthError).toBeUndefined();
  });
});

describe('isTerminalRefreshError', () => {
  it('is true for invalid_grant from Ory (400) and Auth0 (403)', () => {
    expect(isTerminalRefreshError(new RefreshTokenRequestError('x', 400, 'invalid_grant'))).toBe(true);
    expect(isTerminalRefreshError(new RefreshTokenRequestError('x', 403, 'invalid_grant'))).toBe(true);
  });

  it('is false for errors a retry may recover from', () => {
    expect(isTerminalRefreshError(new RefreshTokenRequestError('x', 429, 'rate_limited'))).toBe(false);
    expect(isTerminalRefreshError(new RefreshTokenRequestError('x', 503))).toBe(false);
    expect(isTerminalRefreshError(new RefreshTokenRequestError('x', 401, 'invalid_client'))).toBe(false);
    expect(isTerminalRefreshError(new TypeError('fetch failed'))).toBe(false);
  });
});
