import { createConsentManager } from './consent';
import { httpSend } from './transport';

jest.mock('./transport', () => ({
  httpSend: jest.fn().mockResolvedValue(true),
}));

const mockHttpSend = httpSend as jest.MockedFunction<typeof httpSend>;

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
    const manager = createConsentManager(queue, 'pk_test', 'anon-1', 'dev', 'pixel');
    expect(manager.level).toBe('none');
  });

  it('uses the initial level when provided', () => {
    const queue = createMockQueue();
    const manager = createConsentManager(queue, 'pk_test', 'anon-1', 'dev', 'pixel', 'anonymous');
    expect(manager.level).toBe('anonymous');
  });

  it('upgrades consent without modifying queue', () => {
    const queue = createMockQueue();
    const manager = createConsentManager(queue, 'pk_test', 'anon-1', 'dev', 'pixel', 'none');

    manager.setLevel('anonymous');
    expect(manager.level).toBe('anonymous');
    expect(queue.purge).not.toHaveBeenCalled();
    expect(queue.transform).not.toHaveBeenCalled();
  });

  it('purges queue on downgrade to none', () => {
    const queue = createMockQueue();
    const manager = createConsentManager(queue, 'pk_test', 'anon-1', 'dev', 'pixel', 'full');

    manager.setLevel('none');
    expect(manager.level).toBe('none');
    expect(queue.purge).toHaveBeenCalledWith(expect.any(Function));

    // Verify the purge predicate matches all messages
    const purgeFn = queue.purge.mock.calls[0][0];
    expect(purgeFn({ type: 'page' })).toBe(true);
  });

  it('strips userId on downgrade from full to anonymous', () => {
    const queue = createMockQueue();
    const manager = createConsentManager(queue, 'pk_test', 'anon-1', 'dev', 'pixel', 'full');

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

  it('fires PUT to consent endpoint on level change', () => {
    const queue = createMockQueue();
    const manager = createConsentManager(queue, 'pk_test', 'anon-1', 'dev', 'pixel', 'none');

    manager.setLevel('anonymous');

    expect(mockHttpSend).toHaveBeenCalledWith(
      'https://api.dev.immutable.com/v1/audience/tracking-consent',
      'pk_test',
      { anonymousId: 'anon-1', status: 'anonymous', source: 'pixel' },
      { method: 'PUT', keepalive: true },
    );
  });

  it('does nothing when setting the same level', () => {
    const queue = createMockQueue();
    const manager = createConsentManager(queue, 'pk_test', 'anon-1', 'dev', 'pixel', 'anonymous');

    manager.setLevel('anonymous');
    expect(queue.purge).not.toHaveBeenCalled();
    expect(queue.transform).not.toHaveBeenCalled();
    expect(mockHttpSend).not.toHaveBeenCalled();
  });

  it('respects DNT by defaulting to none', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });

    const queue = createMockQueue();
    const manager = createConsentManager(queue, 'pk_test', 'anon-1', 'dev', 'pixel');
    expect(manager.level).toBe('none');

    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
  });
});
