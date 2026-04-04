import { ConsentManager, detectPrivacySignal } from './consent';

// Mock fetch for server sync
const mockFetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  // Clear cookies
  document.cookie.split(';').forEach((c) => {
    document.cookie = `${c.trim().split('=')[0]}=;max-age=0;path=/`;
  });
});

describe('ConsentManager', () => {
  it('initialises with the provided consent level', () => {
    const manager = new ConsentManager('sandbox', 'pk_test', 'anonymous', 'TestSDK');
    expect(manager.getLevel()).toBe('anonymous');
  });

  it('honours existing consent cookie over initial config', () => {
    // Set a consent cookie before init
    document.cookie = '_imtbl_consent=full;path=/';

    const manager = new ConsentManager('sandbox', 'pk_test', 'none', 'TestSDK');
    expect(manager.getLevel()).toBe('full');
  });

  it('persists consent to cookie on init', () => {
    // eslint-disable-next-line no-new
    new ConsentManager('sandbox', 'pk_test', 'anonymous', 'TestSDK');
    expect(document.cookie).toContain('_imtbl_consent=anonymous');
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

  describe('DNT / GPC', () => {
    it('forces consent to none when DNT is set', () => {
      Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });

      const manager = new ConsentManager('sandbox', 'pk_test', 'full', 'TestSDK');
      expect(manager.getLevel()).toBe('none');

      Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
    });

    it('forces consent to none when GPC is set', () => {
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });

      const manager = new ConsentManager('sandbox', 'pk_test', 'anonymous', 'TestSDK');
      expect(manager.getLevel()).toBe('none');

      Object.defineProperty(navigator, 'globalPrivacyControl', { value: false, configurable: true });
    });

    it('blocks setLevel upgrade when DNT is active', () => {
      Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });

      const manager = new ConsentManager('sandbox', 'pk_test', 'none', 'TestSDK');
      manager.setLevel('full', 'anon-123');
      expect(manager.getLevel()).toBe('none');

      Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
    });

    it('still allows downgrade to none when DNT is active', () => {
      // Start without DNT
      const manager = new ConsentManager('sandbox', 'pk_test', 'full', 'TestSDK');
      expect(manager.getLevel()).toBe('full');

      // Enable DNT, then downgrade
      Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
      const onPurge = jest.fn();
      manager.setLevel('none', 'anon-123', { onPurgeQueue: onPurge });
      expect(manager.getLevel()).toBe('none');
      expect(onPurge).toHaveBeenCalled();

      Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
    });

    it('detectPrivacySignal returns false when no signals set', () => {
      Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: false, configurable: true });
      expect(detectPrivacySignal()).toBe(false);
    });
  });

  it('fetches server consent status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'anonymous' }),
    });

    const manager = new ConsentManager('sandbox', 'pk_test', 'none', 'TestSDK');
    const status = await manager.fetchServerConsent('anon-123');

    expect(status).toBe('anonymous');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.sandbox.immutable.com/v1/audience/tracking-consent?anonymousId=anon-123',
      expect.objectContaining({
        headers: { 'x-immutable-publishable-key': 'pk_test' },
      }),
    );
  });
});
