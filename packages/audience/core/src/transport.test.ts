import { httpTransport } from './transport';

const mockFetch = jest.fn();
global.fetch = mockFetch;

afterEach(() => {
  mockFetch.mockReset();
});

describe('httpTransport', () => {
  it('sends a POST with correct headers and body', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    const payload = { messages: [{ type: 'track' as const }] } as any;
    const ok = await httpTransport.send('/test', 'pk_key', payload);

    expect(ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('/test', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-immutable-publishable-key': 'pk_key',
      },
      keepalive: true,
    }));
  });

  it('returns false on HTTP error', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const ok = await httpTransport.send('/test', 'pk_key', { messages: [] });
    expect(ok).toBe(false);
  });

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValue(new Error('network'));
    const ok = await httpTransport.send('/test', 'pk_key', { messages: [] });
    expect(ok).toBe(false);
  });
});
