import { track } from '@imtbl/metrics';
import {
  createConsentManager, canTrack, canIdentify, detectDoNotTrack,
} from './consent';
import type { HttpSend } from './transport';
import { TransportError } from './errors';

jest.mock('@imtbl/metrics', () => ({
  track: jest.fn(),
}));

function createMockSend() {
  return jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({ ok: true });
}

function createMockQueue() {
  return {
    purge: jest.fn(),
    transform: jest.fn(),
    enqueue: jest.fn(),
    flush: jest.fn(),
    flushUnload: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
    clear: jest.fn(),
    get length() { return 0; },
  } as any;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('consent capability queries', () => {
  it.each([
    ['none', false],
    ['anonymous', true],
    ['full', true],
  ] as const)('canTrack(%s) returns %s', (level, expected) => {
    expect(canTrack(level)).toBe(expected);
  });

  it.each([
    ['none', false],
    ['anonymous', false],
    ['full', true],
  ] as const)('canIdentify(%s) returns %s', (level, expected) => {
    expect(canIdentify(level)).toBe(expected);
  });
});

describe('detectDoNotTrack', () => {
  it('returns false when neither DNT nor GPC is set', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
    expect(detectDoNotTrack()).toBe(false);
  });

  it('returns true when doNotTrack is 1', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    expect(detectDoNotTrack()).toBe(true);
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
  });

  it('returns true when globalPrivacyControl is true', () => {
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
    expect(detectDoNotTrack()).toBe(true);
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
  });
});

describe('createConsentManager', () => {
  it('defaults to none when no initial level provided', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel');
    expect(manager.level).toBe('none');
  });

  it('uses the initial level when provided', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'anonymous');
    expect(manager.level).toBe('anonymous');
  });

  it('upgrades consent without modifying queue', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none');

    manager.setLevel('anonymous');
    expect(manager.level).toBe('anonymous');
    expect(queue.purge).not.toHaveBeenCalled();
    expect(queue.transform).not.toHaveBeenCalled();
  });

  it('purges queue on downgrade to none', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'full');

    manager.setLevel('none');
    expect(manager.level).toBe('none');
    expect(queue.purge).toHaveBeenCalledWith(expect.any(Function));

    // Verify the purge predicate matches all messages
    const purgeFn = queue.purge.mock.calls[0][0];
    expect(purgeFn({ type: 'page' })).toBe(true);
  });

  it('strips userId and downgrades consentLevel on downgrade from full to anonymous', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'full');

    manager.setLevel('anonymous');
    expect(manager.level).toBe('anonymous');
    expect(queue.transform).toHaveBeenCalledWith(expect.any(Function));

    // Verify the transform strips userId and rewrites the stamped consentLevel
    const transformFn = queue.transform.mock.calls[0][0];
    const withUserId = {
      type: 'page', userId: 'u-1', anonymousId: 'a-1', consentLevel: 'full',
    };
    const result = transformFn(withUserId);
    expect(result.userId).toBeUndefined();
    expect(result.anonymousId).toBe('a-1');
    expect(result.consentLevel).toBe('anonymous');
  });

  it('leaves consentLevel absent on downgrade for messages that never carried one', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'web', 'full');

    manager.setLevel('anonymous');

    // A message with no consentLevel (e.g. current web SDK) must not gain one:
    // the field is only rewritten, never introduced, so surfaces that haven't
    // opted in stay untouched.
    const transformFn = queue.transform.mock.calls[0][0];
    const result = transformFn({ type: 'page', userId: 'u-1', anonymousId: 'a-1' });
    expect(result.userId).toBeUndefined();
    expect('consentLevel' in result).toBe(false);
  });

  it('fires PUT to consent endpoint on level change via the injected send', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none');

    manager.setLevel('anonymous');

    expect(send).toHaveBeenCalledWith(
      'https://api.immutable.com/v1/audience/tracking-consent',
      'pk_imapik-test-local',
      { anonymousId: 'anon-1', status: 'anonymous', source: 'pixel' },
      { method: 'PUT', keepalive: true },
    );
  });

  it('does nothing when setting the same level', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'anonymous');

    manager.setLevel('anonymous');
    expect(queue.purge).not.toHaveBeenCalled();
    expect(queue.transform).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('forces none when DNT is set even if initialLevel is not none', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'full');
    expect(manager.level).toBe('none');
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
  });

  it('forces none when GPC is set even if initialLevel is not none', () => {
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'anonymous');
    expect(manager.level).toBe('none');
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
  });

  it('tracks gpc_consent_override metric with signal and configured level when GPC fires', () => {
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
    const queue = createMockQueue();
    const send = createMockSend();
    createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'full');
    const expected = {
      signal: 'gpc', requestedLevel: 'full', context: 'init', publishableKey: 'pk_imapik-test-local',
    };
    expect(track).toHaveBeenCalledWith('audience', 'gpc_consent_overridden', expected);
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
  });

  it('tracks gpc_consent_override metric with dnt signal when DNT fires', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    const queue = createMockQueue();
    const send = createMockSend();
    createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'anonymous');
    const expected = {
      signal: 'dnt', requestedLevel: 'anonymous', context: 'init', publishableKey: 'pk_imapik-test-local',
    };
    expect(track).toHaveBeenCalledWith('audience', 'gpc_consent_overridden', expected);
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
  });

  describe('setLevel GPC enforcement', () => {
    it('caps setLevel to none when GPC is active', () => {
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
      const queue = createMockQueue();
      const send = createMockSend();
      const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none');
      manager.setLevel('anonymous');
      expect(manager.level).toBe('none');
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
    });

    it('tracks gpc_consent_overridden when setLevel is blocked by GPC', () => {
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
      const queue = createMockQueue();
      const send = createMockSend();
      const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none');
      (track as jest.Mock).mockClear();
      manager.setLevel('full');
      const expected = {
        signal: 'gpc', requestedLevel: 'full', context: 'runtime', publishableKey: 'pk_imapik-test-local',
      };
      expect(track).toHaveBeenCalledWith('audience', 'gpc_consent_overridden', expected);
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
    });

    it('tracks gpc_consent_overridden with dnt signal when blocked by DNT at runtime', () => {
      Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
      const queue = createMockQueue();
      const send = createMockSend();
      const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none');
      (track as jest.Mock).mockClear();
      manager.setLevel('full');
      const expected = {
        signal: 'dnt', requestedLevel: 'full', context: 'runtime', publishableKey: 'pk_imapik-test-local',
      };
      expect(track).toHaveBeenCalledWith('audience', 'gpc_consent_overridden', expected);
      Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
    });

    it('does not track gpc_consent_overridden when setting none while GPC is active', () => {
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
      const queue = createMockQueue();
      const send = createMockSend();
      const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none');
      (track as jest.Mock).mockClear();
      manager.setLevel('none');
      expect(track).not.toHaveBeenCalled();
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
    });
  });

  describe('onError callback', () => {
    it('fires onError with mapped CONSENT_SYNC_FAILED on consent PUT failure', async () => {
      const queue = createMockQueue();
      const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
        ok: false,
        error: new TransportError({
          status: 503,
          endpoint: 'https://api.immutable.com/v1/audience/tracking-consent',
          body: { code: 'SERVICE_UNAVAILABLE' },
        }),
      });
      const onError = jest.fn();
      const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none', onError);

      manager.setLevel('anonymous');

      // notifyBackend's .then() runs on the microtask queue.
      await Promise.resolve();
      await Promise.resolve();

      expect(onError).toHaveBeenCalledTimes(1);
      const err = onError.mock.calls[0][0];
      expect(err.code).toBe('CONSENT_SYNC_FAILED');
      expect(err.status).toBe(503);
      expect(err.message).toBe('Consent sync failed with status 503');
    });

    it('fires onError with NETWORK_ERROR on network failure', async () => {
      const queue = createMockQueue();
      const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
        ok: false,
        error: new TransportError({
          status: 0,
          endpoint: 'https://api.immutable.com/v1/audience/tracking-consent',
          cause: new TypeError('Failed to fetch'),
        }),
      });
      const onError = jest.fn();
      const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none', onError);

      manager.setLevel('anonymous');
      await Promise.resolve();
      await Promise.resolve();

      expect(onError).toHaveBeenCalledTimes(1);
      const err = onError.mock.calls[0][0];
      expect(err.code).toBe('NETWORK_ERROR');
      expect(err.message).toBe('Network error syncing consent');
    });

    it('does not fire onError on successful consent sync', async () => {
      const queue = createMockQueue();
      const send = createMockSend();
      const onError = jest.fn();
      const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none', onError);

      manager.setLevel('anonymous');
      await Promise.resolve();
      await Promise.resolve();

      expect(onError).not.toHaveBeenCalled();
    });

    it('swallows exceptions thrown from the onError callback', async () => {
      const queue = createMockQueue();
      const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
        ok: false,
        error: new TransportError({ status: 500, endpoint: 'x', body: null }),
      });
      const onError = jest.fn().mockImplementation(() => { throw new Error('callback boom'); });
      const manager = createConsentManager(queue, send, 'pk_imapik-test-local', 'anon-1', 'pixel', 'none', onError);

      // Synchronous call must not throw even though the .then() handler will.
      expect(() => manager.setLevel('anonymous')).not.toThrow();

      await Promise.resolve();
      await Promise.resolve();
      expect(onError).toHaveBeenCalled();
    });
  });
});
