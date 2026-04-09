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

  it('returns ok on 2xx response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const result = await httpSend('https://example.com', 'pk', payload);
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
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
});
