import type { BatchPayload } from '@imtbl/audience-core';
import { sendMessages } from './transport';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

const payload: BatchPayload = {
  messages: [{
    type: 'track',
    messageId: '123',
    eventTimestamp: '2026-04-03T00:00:00Z',
    anonymousId: 'anon-1',
    context: { library: '@imtbl/audience-web-sdk', libraryVersion: '0.1.0' },
    eventName: 'test',
    surface: 'web',
  }],
};

describe('sendMessages', () => {
  it('sends a POST with correct headers and body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    const result = await sendMessages('https://api.test.com/v1/audience/messages', 'pk_test', payload);

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test.com/v1/audience/messages',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-immutable-publishable-key': 'pk_test',
        },
        body: JSON.stringify(payload),
        keepalive: false,
      }),
    );
  });

  it('returns false on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    const result = await sendMessages('https://api.test.com/v1/audience/messages', 'pk_test', payload);
    expect(result).toBe(false);
  });

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await sendMessages('https://api.test.com/v1/audience/messages', 'pk_test', payload);
    expect(result).toBe(false);
  });

  it('passes keepalive flag for unload flushes', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    await sendMessages('https://api.test.com/v1/audience/messages', 'pk_test', payload, true);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ keepalive: true }),
    );
  });
});
