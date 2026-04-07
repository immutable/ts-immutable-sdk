import { httpSend } from './transport';
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

  it('returns true on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    expect(await httpSend('https://example.com', 'pk', payload)).toBe(true);
  });

  it('returns false on HTTP error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    expect(await httpSend('https://example.com', 'pk', payload)).toBe(false);
  });

  it('returns false on network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await httpSend('https://example.com', 'pk', payload)).toBe(false);
  });
});
