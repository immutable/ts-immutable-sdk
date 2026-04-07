import { ConsentManager } from './consent';

// Mock fetch for server sync
const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ConsentManager', () => {
  it('initialises with the provided consent level', () => {
    const manager = new ConsentManager('sandbox', 'pk_test', 'anonymous', 'TestSDK');
    expect(manager.getLevel()).toBe('anonymous');
  });

  it('calls onPurgeQueue when downgrading to none', () => {
    const manager = new ConsentManager('sandbox', 'pk_test', 'full', 'TestSDK');
    const onPurge = jest.fn();
    const onClear = jest.fn();

    manager.setLevel('none', 'anon-123', {
      onPurgeQueue: onPurge,
      onClearCookies: onClear,
    });

    expect(onPurge).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalled();
    expect(manager.getLevel()).toBe('none');
  });

  it('calls onStripIdentity when downgrading from full to anonymous', () => {
    const manager = new ConsentManager('sandbox', 'pk_test', 'full', 'TestSDK');
    const onStrip = jest.fn();

    manager.setLevel('anonymous', 'anon-123', { onStripIdentity: onStrip });

    expect(onStrip).toHaveBeenCalled();
    expect(manager.getLevel()).toBe('anonymous');
  });

  it('syncs consent to server via PUT on setLevel', () => {
    const manager = new ConsentManager('sandbox', 'pk_test', 'none', 'TestSDK');
    manager.setLevel('full', 'anon-123');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.sandbox.immutable.com/v1/audience/tracking-consent',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          anonymousId: 'anon-123',
          status: 'full',
          source: 'TestSDK',
        }),
      }),
    );
  });
});
