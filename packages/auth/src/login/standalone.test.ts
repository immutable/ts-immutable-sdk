/**
 * Tests for the token-exchange retry in exchangeCodeForTokens, exercised through
 * handleLoginCallback (the shared path used by both popup and redirect flows).
 */

const trackMock = jest.fn();

jest.mock('@imtbl/metrics', () => ({
  track: (...args: unknown[]) => trackMock(...args),
  getDetail: jest.fn(),
  Detail: { RUNTIME_ID: 'runtime_id' },
}));

jest.mock('../utils/jwt', () => ({
  decodeJwtPayload: jest.fn(() => ({})),
}));

// eslint-disable-next-line import/first
import { handleLoginCallback, type LoginConfig } from './standalone';

const CONFIG: LoginConfig = {
  clientId: 'client-123',
  redirectUri: 'https://app.example.com/callback',
  authenticationDomain: 'https://auth.example.com',
};

const PKCE = {
  state: 'state-xyz',
  verifier: 'verifier-abc',
  redirectUri: 'https://app.example.com/callback',
};

const TOKENS = { access_token: 'access-tok', refresh_token: 'refresh-tok' };

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe('exchangeCodeForTokens retry (via handleLoginCallback)', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    window.sessionStorage.setItem('imtbl_pkce_data', JSON.stringify(PKCE));
    window.history.replaceState(null, '', '/?code=auth-code&state=state-xyz');
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    window.sessionStorage.clear();
  });

  it('retries a 5xx and resolves on the next success', async () => {
    fetchMock
      .mockResolvedValueOnce(mockResponse(503, { error: 'unavailable' }))
      .mockResolvedValueOnce(mockResponse(200, TOKENS));

    const promise = handleLoginCallback(CONFIG);
    await jest.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result?.accessToken).toBe('access-tok');
  });

  it('retries a network error and resolves on the next success', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(mockResponse(200, TOKENS));

    const promise = handleLoginCallback(CONFIG);
    await jest.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result?.accessToken).toBe('access-tok');
  });

  it('aborts a hung attempt at the timeout and retries', async () => {
    // First attempt never responds; the per-attempt AbortController should fire at
    // TOKEN_EXCHANGE_TIMEOUT_MS and reject it, which is treated as transient.
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) => new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          reject(Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }));
        });
      }),
    );
    fetchMock.mockResolvedValueOnce(mockResponse(200, TOKENS));

    const promise = handleLoginCallback(CONFIG);
    await jest.advanceTimersByTimeAsync(10000); // fire the attempt timeout -> abort
    await jest.advanceTimersByTimeAsync(1000); // backoff before the retry
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result?.accessToken).toBe('access-tok');
  });

  it('does not retry a 4xx', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(400, { error: 'invalid_grant' }));

    await expect(handleLoginCallback(CONFIG)).rejects.toThrow('invalid_grant');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up after exhausting retries', async () => {
    fetchMock.mockResolvedValue(mockResponse(500, { error: 'boom' }));

    const promise = handleLoginCallback(CONFIG);
    promise.catch(() => {}); // avoid an unhandled rejection while advancing timers
    await jest.advanceTimersByTimeAsync(3000); // 1s + 2s backoffs

    await expect(promise).rejects.toThrow('boom');
    expect(fetchMock).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});
