import { Pixel } from './pixel';

// Mock autocapture module
const mockTeardownAutocapture = jest.fn();
const mockSetupAutocapture = jest.fn().mockReturnValue(mockTeardownAutocapture);
jest.mock('./autocapture', () => ({
  setupAutocapture: (...args: unknown[]) => mockSetupAutocapture(...args),
}));

// Mock audience-core
const mockEnqueue = jest.fn();
const mockStart = jest.fn();
const mockDestroy = jest.fn();
const mockPurge = jest.fn();
const mockTransform = jest.fn();
const mockGetOrCreateSession = jest.fn().mockReturnValue({ sessionId: 'session-abc', isNew: true });

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
  httpSend: jest.fn().mockResolvedValue({ ok: true }),
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
  isBrowser: jest.fn().mockReturnValue(true),
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  collectAttribution: jest.fn().mockReturnValue({
    utm_source: 'google',
    landing_page: 'https://example.com',
  }),
  getOrCreateSession: (...args: unknown[]) => mockGetOrCreateSession(...args),
  createConsentManager: jest.fn().mockImplementation(
    (
      _queue: unknown,
      _send: unknown,
      _key: unknown,
      _anonId: unknown,
      _env: unknown,
      _source: unknown,
      level?: string,
    ) => {
      let current = level ?? 'none';
      return {
        get level() { return current; },
        setLevel(next: string) { current = next; },
      };
    },
  ),
}));

// Mock fetch globally
global.fetch = jest.fn().mockResolvedValue({ ok: true });

const mockGetCookie = jest.requireMock('@imtbl/audience-core').getCookie as jest.Mock;

let activePixel: Pixel | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: true });
});

afterEach(() => {
  // Clean up any active pixel to remove event listeners
  if (activePixel) {
    activePixel.destroy();
    activePixel = null;
  }
});

describe('Pixel', () => {
  describe('init', () => {
    it('creates queue, starts it, and fires page view + session_start when consent is anonymous', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      expect(mockStart).toHaveBeenCalled();

      // Should fire session_start (new session) then page view
      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      const pageCall = calls.find((c) => c.type === 'page');
      const sessionStartCall = calls.find(
        (c) => c.type === 'track' && c.eventName === 'session_start',
      );

      expect(pageCall).toBeDefined();
      expect(pageCall!.surface).toBe('pixel');
      expect(pageCall!.anonymousId).toBe('anon-123');
      expect((pageCall!.properties as Record<string, unknown>).utm_source).toBe('google');

      expect(sessionStartCall).toBeDefined();
      expect((sessionStartCall!.properties as Record<string, unknown>).sessionId).toBe('session-abc');
    });

    it('does not fire page view or session_start when consent is none', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'none' });

      expect(mockStart).toHaveBeenCalled();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('does not fire session_start for existing sessions', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      const sessionStartCall = calls.find(
        (c) => c.type === 'track' && c.eventName === 'session_start',
      );

      expect(sessionStartCall).toBeUndefined();
      // Page view should still fire
      expect(calls.find((c) => c.type === 'page')).toBeDefined();
    });

    it('only initializes once', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });
      pixel.init({ key: 'pk_other', environment: 'dev', consent: 'anonymous' });

      expect(mockStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('page', () => {
    it('enqueues a page message with attribution and session', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });
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
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'none' });

      pixel.page();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('includes GA and Meta cookies in page properties when present', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });
      mockGetCookie.mockImplementation((name: string) => {
        const cookies: Record<string, string> = {
          _ga: 'GA1.2.123456.789012',
          _fbc: 'fb.1.1234567890.AbCdEf',
          _fbp: 'fb.1.1234567890.987654321',
        };
        return cookies[name];
      });

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      const pageCall = calls.find((c) => c.type === 'page');
      const props = pageCall!.properties as Record<string, unknown>;

      expect(props.gaClientId).toBe('GA1.2.123456.789012');
      expect(props.fbClickId).toBe('fb.1.1234567890.AbCdEf');
      expect(props.fbBrowserId).toBe('fb.1.1234567890.987654321');
    });

    it('omits third-party IDs when cookies are not set', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });
      mockGetCookie.mockReturnValue(undefined);

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      const pageCall = calls.find((c) => c.type === 'page');
      const props = pageCall!.properties as Record<string, unknown>;

      expect(props.gaClientId).toBeUndefined();
      expect(props.fbClickId).toBeUndefined();
      expect(props.fbBrowserId).toBeUndefined();
    });
  });

  describe('identify', () => {
    it('enqueues identify message at full consent', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });

      const pixel = new Pixel();
      activePixel = pixel;
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
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      pixel.identify('user-1');
      // Only the auto page view + session_start, no identify
      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.find((c) => c.type === 'identify')).toBeUndefined();
    });
  });

  describe('session_end', () => {
    it('fires session_end on pagehide when session is active', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });
      mockEnqueue.mockClear();

      // Simulate pagehide
      window.dispatchEvent(new Event('pagehide'));

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          eventName: 'session_end',
          properties: expect.objectContaining({
            sessionId: 'session-abc',
          }),
        }),
      );
    });

    it('includes duration in session_end', () => {
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000000);

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });
      mockEnqueue.mockClear();

      // Advance time by 15 seconds before triggering pagehide
      dateNowSpy.mockReturnValue(1015000);
      window.dispatchEvent(new Event('pagehide'));

      const sessionEndCall = mockEnqueue.mock.calls.find(
        (c: unknown[]) => (c[0] as Record<string, unknown>).eventName === 'session_end',
      );
      expect(sessionEndCall).toBeDefined();
      expect((sessionEndCall![0] as Record<string, unknown>).properties).toEqual(
        expect.objectContaining({ duration: 15 }),
      );

      dateNowSpy.mockRestore();
    });

    it('does not fire session_end when consent is none', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'none' });

      window.dispatchEvent(new Event('pagehide'));
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  describe('setConsent', () => {
    it('updates consent level', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'none' });

      pixel.setConsent('anonymous');

      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-xyz', isNew: false });
      pixel.page();
      expect(mockEnqueue).toHaveBeenCalledWith(expect.objectContaining({ type: 'page' }));
    });
  });

  describe('destroy', () => {
    it('destroys the queue and resets state', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      pixel.destroy();
      expect(mockDestroy).toHaveBeenCalled();

      // After destroy, page() should be a no-op
      mockEnqueue.mockClear();
      pixel.page();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('tears down autocapture listeners', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      pixel.destroy();
      expect(mockTeardownAutocapture).toHaveBeenCalled();
    });
  });

  describe('autocapture integration', () => {
    it('sets up autocapture with default options on init', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      expect(mockSetupAutocapture).toHaveBeenCalledWith(
        { forms: undefined, clicks: undefined },
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('passes autocapture options to setupAutocapture', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({
        key: 'pk_test',
        environment: 'dev',
        consent: 'anonymous',
        autocapture: { forms: false, clicks: true },
      });

      expect(mockSetupAutocapture).toHaveBeenCalledWith(
        { forms: false, clicks: true },
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('enqueue callback fires TrackMessage with session', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-xyz', isNew: false });

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });
      mockEnqueue.mockClear();

      // Call the enqueue callback that was passed to setupAutocapture
      const enqueueCallback = mockSetupAutocapture.mock.calls[0][1] as (
        eventName: string,
        properties: Record<string, unknown>,
      ) => void;
      enqueueCallback('form_submitted', { formAction: '/signup' });

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          eventName: 'form_submitted',
          surface: 'pixel',
          properties: expect.objectContaining({
            formAction: '/signup',
            sessionId: 'session-xyz',
          }),
        }),
      );
    });

    it('consent callback returns current consent level', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_test', environment: 'dev', consent: 'anonymous' });

      const getConsent = mockSetupAutocapture.mock.calls[0][2] as () => string;
      expect(getConsent()).toBe('anonymous');

      pixel.setConsent('full');
      expect(getConsent()).toBe('full');
    });
  });
});
