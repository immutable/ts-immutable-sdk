import { Pixel } from './pixel';

// Mock audience-core
const mockEnqueue = jest.fn();
const mockStart = jest.fn();
const mockDestroy = jest.fn();
const mockPurge = jest.fn();
const mockTransform = jest.fn();

jest.mock('@imtbl/audience-core', () => ({
  MessageQueue: jest.fn().mockImplementation(() => ({
    enqueue: mockEnqueue,
    start: mockStart,
    destroy: mockDestroy,
    purge: mockPurge,
    transform: mockTransform,
    stop: jest.fn(),
    flush: jest.fn(),
    flushUnload: jest.fn(),
    clear: jest.fn(),
    get length() { return 0; },
  })),
  httpTransport: { send: jest.fn().mockResolvedValue(true) },
  httpSend: jest.fn().mockResolvedValue(true),
  getBaseUrl: jest.fn().mockReturnValue('https://api.dev.immutable.com'),
  INGEST_PATH: '/v1/audience/messages',
  CONSENT_PATH: '/v1/audience/tracking-consent',
  FLUSH_INTERVAL_MS: 5000,
  FLUSH_SIZE: 20,
  getOrCreateAnonymousId: jest.fn().mockReturnValue('anon-123'),
  collectContext: jest.fn().mockReturnValue({
    library: '@imtbl/pixel',
    libraryVersion: '0.0.0',
    userAgent: 'test',
  }),
  generateId: jest.fn().mockReturnValue('msg-uuid'),
  getTimestamp: jest.fn().mockReturnValue('2026-04-07T00:00:00.000Z'),
  getCookie: jest.fn(),
  setCookie: jest.fn(),
}));

// Mock internal modules
jest.mock('./attribution', () => ({
  collectAttribution: jest.fn().mockReturnValue({
    utm_source: 'google',
    landing_page: 'https://example.com',
  }),
}));

jest.mock('./session', () => ({
  getOrCreateSessionId: jest.fn().mockReturnValue('session-abc'),
}));

// Mock fetch globally
global.fetch = jest.fn().mockResolvedValue({ ok: true });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Pixel', () => {
  describe('init', () => {
    it('creates queue, starts it, and fires a page view when consent is anonymous', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      expect(mockStart).toHaveBeenCalled();
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'page',
          surface: 'pixel',
          anonymousId: 'anon-123',
          properties: expect.objectContaining({
            utm_source: 'google',
            sessionId: 'session-abc',
          }),
        }),
      );
    });

    it('does not fire page view when consent is none', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'none' });

      expect(mockStart).toHaveBeenCalled();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('only initializes once', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });
      pixel.init({ key: 'pk_other', environment: 'dev', consent: 'anonymous' });

      // Start called only once
      expect(mockStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('page', () => {
    it('enqueues a page message with attribution and session', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      // Clear the auto-fired page view
      mockEnqueue.mockClear();

      pixel.page({ custom: 'prop' });

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'page',
          surface: 'pixel',
          properties: expect.objectContaining({
            utm_source: 'google',
            sessionId: 'session-abc',
            custom: 'prop',
          }),
        }),
      );
    });

    it('does not enqueue when consent is none', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'none' });

      pixel.page();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  describe('identify', () => {
    it('enqueues identify message at full consent', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'full' });
      mockEnqueue.mockClear();

      pixel.identify('user-1', { email: 'test@example.com' });

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'identify',
          userId: 'user-1',
          surface: 'pixel',
          traits: expect.objectContaining({
            email: 'test@example.com',
            sessionId: 'session-abc',
          }),
        }),
      );
    });

    it('does not enqueue identify at anonymous consent', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      pixel.identify('user-1');
      // Only the auto page view, no identify
      expect(mockEnqueue).toHaveBeenCalledTimes(1);
      expect(mockEnqueue).toHaveBeenCalledWith(expect.objectContaining({ type: 'page' }));
    });
  });

  describe('setConsent', () => {
    it('updates consent level', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'none' });

      pixel.setConsent('anonymous');

      // After upgrading consent, page() should work
      pixel.page();
      expect(mockEnqueue).toHaveBeenCalledWith(expect.objectContaining({ type: 'page' }));
    });
  });

  describe('destroy', () => {
    it('destroys the queue and resets state', () => {
      const pixel = new Pixel();
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      pixel.destroy();
      expect(mockDestroy).toHaveBeenCalled();

      // After destroy, page() should be a no-op
      mockEnqueue.mockClear();
      pixel.page();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });
});
