/* eslint-disable @typescript-eslint/no-require-imports, global-require */

// We need to control when bootstrap.ts runs, so we use dynamic require
// after setting up the window stub and mocks.

const mockInit = jest.fn();
const mockPage = jest.fn();
const mockIdentify = jest.fn();
const mockSetConsent = jest.fn();
const mockDestroy = jest.fn();

jest.mock('./pixel', () => ({
  Pixel: jest.fn().mockImplementation(() => ({
    init: mockInit,
    page: mockPage,
    identify: mockIdentify,
    setConsent: mockSetConsent,
    destroy: mockDestroy,
  })),
}));

jest.mock('@imtbl/audience-core', () => ({
  MessageQueue: jest.fn(),
  httpTransport: {},
  getBaseUrl: jest.fn(),
  INGEST_PATH: '',
  FLUSH_INTERVAL_MS: 5000,
  FLUSH_SIZE: 20,
  getOrCreateAnonymousId: jest.fn(),
  collectContext: jest.fn(),
  generateId: jest.fn(),
  getTimestamp: jest.fn(),
  isBrowser: jest.fn().mockReturnValue(true),
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  collectAttribution: jest.fn().mockReturnValue({}),
  getOrCreateSession: jest.fn().mockReturnValue({ sessionId: 's', isNew: false }),
  createConsentManager: jest.fn().mockReturnValue({ level: 'none', setLevel: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  delete (window as Record<string, unknown>).__imtbl;
  // Re-isolate module so the side-effect runs fresh
  jest.resetModules();
});

describe('bootstrap', () => {
  it('replays queued init command from snippet stub', () => {
    // Simulate snippet having queued an init command
    (window as Record<string, unknown>).__imtbl = [
      ['init', { key: 'pk_test', environment: 'dev', consent: 'anonymous' }],
    ];

    require('./bootstrap');

    expect(mockInit).toHaveBeenCalledWith({
      key: 'pk_test',
      environment: 'dev',
      consent: 'anonymous',
    });
  });

  it('replays multiple queued commands in order', () => {
    (window as Record<string, unknown>).__imtbl = [
      ['init', { key: 'pk_test' }],
      ['consent', 'full'],
      ['identify', 'user-1', 'passport', { email: 'a@b.com' }],
    ];

    require('./bootstrap');

    expect(mockInit).toHaveBeenCalledWith({ key: 'pk_test' });
    expect(mockSetConsent).toHaveBeenCalledWith('full');
    expect(mockIdentify).toHaveBeenCalledWith('user-1', 'passport', { email: 'a@b.com' });
  });

  it('installs loader and handles new commands after load', () => {
    require('./bootstrap');

    const loader = (window as Record<string, unknown>).__imtbl as {
      push: (...args: unknown[]) => void;
      _loaded: boolean;
    };

    expect(loader._loaded).toBe(true);

    loader.push(['page', { custom: 'prop' }]);
    expect(mockPage).toHaveBeenCalledWith({ custom: 'prop' });

    loader.push(['consent', 'anonymous']);
    expect(mockSetConsent).toHaveBeenCalledWith('anonymous');
  });

  it('ignores unknown commands', () => {
    (window as Record<string, unknown>).__imtbl = [
      ['nonexistent', 'arg1'],
    ];

    // Should not throw
    expect(() => require('./bootstrap')).not.toThrow();
  });

  it('works when no stub exists on window', () => {
    expect(() => require('./bootstrap')).not.toThrow();

    const loader = (window as Record<string, unknown>).__imtbl as {
      _loaded: boolean;
    };
    expect(loader._loaded).toBe(true);
  });
});
