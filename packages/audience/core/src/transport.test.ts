import { httpSend } from './transport';
import { TransportError } from './errors';
import type { BatchPayload } from './types';

const payload: BatchPayload = {
  messages: [
    {
      type: 'track',
      messageId: 'msg-1',
      eventTimestamp: '2026-04-01T00:00:00.000Z',
      anonymousId: 'anon-1',
      surface: 'web',
      context: { library: '@imtbl/audience', libraryVersion: '0.0.0' },
      eventName: 'purchase',
      properties: { value: 9.99 },
    },
  ],
};

describe('httpSend', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends POST with correct headers and body', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await httpSend('https://api.immutable.com/v1/audience/messages', 'pk_imx_test', payload);

    expect(mockFetch).toHaveBeenCalledWith('https://api.immutable.com/v1/audience/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-immutable-publishable-key': 'pk_imx_test',
      },
      body: JSON.stringify(payload),
      keepalive: undefined,
      signal: expect.any(AbortSignal),
    });
  });

  it('passes keepalive option when specified', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await httpSend('https://example.com', 'pk', payload, { keepalive: true });

    expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
      keepalive: true,
    }));
  });

  it('uses specified method from options', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const consentPayload = { anonymousId: 'anon-1', status: 'anonymous' as const, source: 'pixel' };
    await httpSend('https://example.com/consent', 'pk', consentPayload, { method: 'PUT', keepalive: true });

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/consent', expect.objectContaining({
      method: 'PUT',
      keepalive: true,
      body: JSON.stringify(consentPayload),
    }));
  });

  it('returns ok on 2xx response with no body', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const result = await httpSend('https://example.com', 'pk', payload);
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns ok on 2xx response when body reports zero rejected', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, accepted: 1, rejected: 0 }),
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns ok:false with status 200 when backend reports partial rejection', async () => {
    // The silent-drop bug: backend returns 200 with { accepted: 1, rejected: 1 }
    // and the queue used to clear the entire batch without surfacing the
    // rejection. After this fix httpSend treats it as a structured failure.
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, accepted: 1, rejected: 1 }),
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(false);
    expect(result.error?.status).toBe(200);
    expect(result.error?.body).toEqual({ success: true, accepted: 1, rejected: 1 });
  });

  it('returns structured error on HTTP failure with parsed JSON body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: { get: () => 'application/json' },
      json: async () => ({ code: 'INVALID_PAYLOAD' }),
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(TransportError);
    expect(result.error).toMatchObject({
      status: 422,
      endpoint: 'https://example.com',
      body: { code: 'INVALID_PAYLOAD' },
    });
  });

  it('TransportError is a real Error with a stack trace', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => 'text/plain' },
      text: async () => 'boom',
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.name).toBe('TransportError');
    expect(typeof result.error?.stack).toBe('string');
  });

  it('returns structured error on HTTP failure with text body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => 'text/plain' },
      text: async () => 'Internal Server Error',
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(false);
    expect(result.error?.status).toBe(500);
    expect(result.error?.body).toBe('Internal Server Error');
  });

  it('returns structured error with status 0 and cause on network failure', async () => {
    const networkError = new TypeError('Failed to fetch');
    global.fetch = jest.fn().mockRejectedValue(networkError);

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(false);
    expect(result.error?.status).toBe(0);
    expect(result.error?.endpoint).toBe('https://example.com');
    expect(result.error?.cause).toBe(networkError);
  });

  it('never rejects — even when fetch throws synchronously', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error('synchronous boom');
    });

    await expect(httpSend('https://example.com', 'pk', payload)).resolves.toBeDefined();
  });

  it('returns status 0 NETWORK_ERROR when the 30s timeout fires', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockImplementation(
      (_url: string, init: RequestInit) => new Promise<Response>((_resolve, reject) => {
        (init.signal as AbortSignal).addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
    );

    const sendPromise = httpSend('https://example.com', 'pk', payload);
    jest.advanceTimersByTime(30_000);
    const result = await sendPromise;

    expect(result.ok).toBe(false);
    expect(result.error?.status).toBe(0);

    jest.useRealTimers();
  });

  it('returns ok:false with status 429 on rate limit response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: () => null },
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(false);
    expect(result.error?.status).toBe(429);
    expect(result.retryAfterMs).toBeUndefined();
  });

  it('attaches retryAfterMs (seconds) when 429 includes Retry-After delta-seconds', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: (name: string) => (name === 'retry-after' ? '60' : null) },
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(false);
    expect(result.retryAfterMs).toBe(60_000);
  });

  it('attaches retryAfterMs (HTTP-date) when 429 includes a future Retry-After date', async () => {
    const futureDate = new Date(Date.now() + 45_000).toUTCString();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: (name: string) => (name === 'retry-after' ? futureDate : null) },
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(45_000);
  });

  it('omits retryAfterMs when the Retry-After date is in the past', async () => {
    const pastDate = new Date(Date.now() - 1_000).toUTCString();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: { get: (name: string) => (name === 'retry-after' ? pastDate : null) },
    });

    const result = await httpSend('https://example.com', 'pk', payload);

    expect(result.ok).toBe(false);
    expect(result.retryAfterMs).toBeUndefined();
  });

  it('passes the AbortSignal to fetch', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    await httpSend('https://api.immutable.com/v1/audience/messages', 'pk_imx_test', payload);

    expect(mockFetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
});
