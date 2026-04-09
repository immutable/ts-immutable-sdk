import { createConsentManager } from './consent';
import type { HttpSend } from './transport';
import { TransportError } from './errors';

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

describe('createConsentManager', () => {
  it('defaults to none when no initial level provided', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel');
    expect(manager.level).toBe('none');
  });

  it('uses the initial level when provided', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'anonymous');
    expect(manager.level).toBe('anonymous');
  });

  it('upgrades consent without modifying queue', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'none');

    manager.setLevel('anonymous');
    expect(manager.level).toBe('anonymous');
    expect(queue.purge).not.toHaveBeenCalled();
    expect(queue.transform).not.toHaveBeenCalled();
  });

  it('purges queue on downgrade to none', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'full');

    manager.setLevel('none');
    expect(manager.level).toBe('none');
    expect(queue.purge).toHaveBeenCalledWith(expect.any(Function));

    // Verify the purge predicate matches all messages
    const purgeFn = queue.purge.mock.calls[0][0];
    expect(purgeFn({ type: 'page' })).toBe(true);
  });

  it('strips userId on downgrade from full to anonymous', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'full');

    manager.setLevel('anonymous');
    expect(manager.level).toBe('anonymous');
    expect(queue.transform).toHaveBeenCalledWith(expect.any(Function));

    // Verify the transform strips userId
    const transformFn = queue.transform.mock.calls[0][0];
    const withUserId = { type: 'page', userId: 'u-1', anonymousId: 'a-1' };
    const result = transformFn(withUserId);
    expect(result.userId).toBeUndefined();
    expect(result.anonymousId).toBe('a-1');
  });

  it('fires PUT to consent endpoint on level change via the injected send', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'none');

    manager.setLevel('anonymous');

    expect(send).toHaveBeenCalledWith(
      'https://api.dev.immutable.com/v1/audience/tracking-consent',
      'pk_test',
      { anonymousId: 'anon-1', status: 'anonymous', source: 'pixel' },
      { method: 'PUT', keepalive: true },
    );
  });

  it('does nothing when setting the same level', () => {
    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'anonymous');

    manager.setLevel('anonymous');
    expect(queue.purge).not.toHaveBeenCalled();
    expect(queue.transform).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('respects DNT by defaulting to none', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });

    const queue = createMockQueue();
    const send = createMockSend();
    const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel');
    expect(manager.level).toBe('none');

    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
  });

  describe('onError callback', () => {
    it('fires onError with mapped CONSENT_SYNC_FAILED on consent PUT failure', async () => {
      const queue = createMockQueue();
      const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
        ok: false,
        error: new TransportError({
          status: 503,
          endpoint: 'https://api.dev.immutable.com/v1/audience/tracking-consent',
          body: { code: 'SERVICE_UNAVAILABLE' },
        }),
      });
      const onError = jest.fn();
      const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'none', onError);

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
          endpoint: 'https://api.dev.immutable.com/v1/audience/tracking-consent',
          cause: new TypeError('Failed to fetch'),
        }),
      });
      const onError = jest.fn();
      const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'none', onError);

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
      const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'none', onError);

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
      const manager = createConsentManager(queue, send, 'pk_test', 'anon-1', 'dev', 'pixel', 'none', onError);

      // Synchronous call must not throw even though the .then() handler will.
      expect(() => manager.setLevel('anonymous')).not.toThrow();

      await Promise.resolve();
      await Promise.resolve();
      expect(onError).toHaveBeenCalled();
    });
  });
});
