import { Pixel } from './pixel';

// Mock autocapture (now shared via @imtbl/audience-core, wired into that mock below)
const mockTeardownAutocapture = jest.fn();
const mockResetScrollDepth = jest.fn();
const mockSetupAutocapture = jest.fn().mockReturnValue({
  teardown: mockTeardownAutocapture,
  resetScroll: mockResetScrollDepth,
});

// Third-party ID collection (also shared via @imtbl/audience-core)
const mockCollectThirdPartyIds = jest.fn().mockReturnValue({});

// CMP detection mock — defined here, wired into the audience-core mock below
const mockTeardownCmp = jest.fn();
const mockStartCmpDetection = jest.fn().mockReturnValue(mockTeardownCmp);

// Mock audience-core
const mockEnqueue = jest.fn();
const mockStart = jest.fn();
const mockDestroy = jest.fn();
const mockGetOrCreateSession = jest.fn().mockReturnValue({ sessionId: 'session-abc', isNew: true });

jest.mock('@imtbl/audience-core', () => ({
  MessageQueue: jest.fn().mockImplementation(() => ({
    enqueue: mockEnqueue,
    start: mockStart,
    destroy: mockDestroy,
    stop: jest.fn(),
    flush: jest.fn(),
    flushUnload: jest.fn(),
    clear: jest.fn(),
    get length() { return 0; },
  })),
  httpSend: jest.fn().mockResolvedValue({ ok: true }),
  getOrCreateAnonymousId: jest.fn().mockReturnValue('anon-123'),
  collectContext: jest.fn().mockReturnValue({
    library: '@imtbl/pixel',
    libraryVersion: '0.0.0',
    userAgent: 'test',
  }),
  generateId: jest.fn().mockReturnValue('msg-uuid'),
  getTimestamp: jest.fn().mockReturnValue('2026-04-07T00:00:00.000Z'),
  isBrowser: jest.fn().mockReturnValue(true),
  collectSessionAttribution: jest.fn().mockReturnValue({
    utm_source: 'google',
    landing_page: 'https://example.com',
  }),
  collectThirdPartyIds: (...args: unknown[]) => mockCollectThirdPartyIds(...args),
  setupAutocapture: (...args: unknown[]) => mockSetupAutocapture(...args),
  getOrCreateSession: (...args: unknown[]) => mockGetOrCreateSession(...args),
  startCmpDetection: (...args: unknown[]) => mockStartCmpDetection(...args),
  createConsentManager: jest.fn().mockImplementation(
    (
      _send: unknown,
      _key: unknown,
      _anonId: unknown,
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
  canTrack: jest.fn().mockImplementation((level: string) => level !== 'none'),
}));

// Mock fetch globally
global.fetch = jest.fn().mockResolvedValue({ ok: true });

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
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

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
      expect(sessionStartCall!.sessionId).toBe('session-abc');
    });

    it('does not fire page view or session_start when consent is none', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'none' });

      expect(mockStart).toHaveBeenCalled();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('does not fire session_start for existing sessions', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

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
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });
      pixel.init({ key: 'pk_imapik-test-other', consent: 'anonymous' });

      expect(mockStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('page', () => {
    it('enqueues a page message with attribution and session', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });
      mockEnqueue.mockClear();

      pixel.page({ custom: 'prop' });

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'page',
          surface: 'pixel',
          sessionId: 'session-abc',
          properties: expect.objectContaining({
            utm_source: 'google',
            custom: 'prop',
          }),
        }),
      );
    });

    it('does not enqueue when consent is none', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'none' });

      pixel.page();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('includes GA and Meta cookies in page properties when present', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });
      mockCollectThirdPartyIds.mockReturnValue({
        ga_client_id: 'GA1.2.123456.789012',
        fb_click_id: 'fb.1.1234567890.AbCdEf',
        fb_browser_id: 'fb.1.1234567890.987654321',
      });

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      const pageCall = calls.find((c) => c.type === 'page');
      const props = pageCall!.properties as Record<string, unknown>;

      expect(props.ga_client_id).toBe('GA1.2.123456.789012');
      expect(props.fb_click_id).toBe('fb.1.1234567890.AbCdEf');
      expect(props.fb_browser_id).toBe('fb.1.1234567890.987654321');
    });

    it('omits third-party IDs when cookies are not set', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-abc', isNew: false });
      mockCollectThirdPartyIds.mockReturnValue({});

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      const pageCall = calls.find((c) => c.type === 'page');
      const props = pageCall!.properties as Record<string, unknown>;

      expect(props.ga_client_id).toBeUndefined();
      expect(props.fb_click_id).toBeUndefined();
      expect(props.fb_browser_id).toBeUndefined();
    });
  });

  describe('consent level', () => {
    it('stamps the anonymous consent level on every emitted message', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.length).toBeGreaterThan(0);
      calls.forEach((c) => expect(c.consentLevel).toBe('anonymous'));
    });

    it('stamps full consent with no userId (full-but-unidentified)', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'full' });

      const pageCall = mockEnqueue.mock.calls
        .map((c: unknown[]) => (c[0] as Record<string, unknown>))
        .find((c) => c.type === 'page');
      expect(pageCall!.consentLevel).toBe('full');
      expect(pageCall!.userId).toBeUndefined();
    });

    it('reflects an upgraded consent level on later events', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });
      pixel.setConsent('full');
      mockEnqueue.mockClear();

      pixel.page();

      const pageCall = mockEnqueue.mock.calls
        .map((c: unknown[]) => (c[0] as Record<string, unknown>))
        .find((c) => c.type === 'page');
      expect(pageCall!.consentLevel).toBe('full');
    });
  });

  describe('session id', () => {
    it('stamps sessionId at the top level on both page and track (session_start) messages', () => {
      // Default mock (isNew: true) means init() fires both a page view and a session_start track event.
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      const pageCall = calls.find((c) => c.type === 'page');
      const trackCall = calls.find((c) => c.type === 'track');

      expect(pageCall).toBeDefined();
      expect(trackCall).toBeDefined();
      expect(pageCall!.sessionId).toBe('session-abc');
      expect(trackCall!.sessionId).toBe('session-abc');
    });
  });

  describe('session_end', () => {
    it('fires session_end on pagehide when session is active', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });
      mockEnqueue.mockClear();

      // Simulate pagehide
      window.dispatchEvent(new Event('pagehide'));

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          eventName: 'session_end',
          sessionId: 'session-abc',
        }),
      );
    });

    it('includes duration in session_end', () => {
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000000);

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });
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
      pixel.init({ key: 'pk_imapik-test-local', consent: 'none' });

      window.dispatchEvent(new Event('pagehide'));
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  describe('setConsent', () => {
    it('updates consent level and allows tracking', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'none' });

      pixel.setConsent('anonymous');

      // setConsent should have auto-fired the deferred initial page view
      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.find((c) => c.type === 'page')).toBeDefined();
    });

    it('fires deferred page view only once on repeated setConsent calls', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'none' });

      pixel.setConsent('anonymous');
      mockEnqueue.mockClear();

      // Second setConsent should NOT fire another page view
      pixel.setConsent('full');
      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.find((c) => c.type === 'page')).toBeUndefined();
    });
  });

  describe('destroy', () => {
    it('destroys the queue and resets state', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

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
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

      pixel.destroy();
      expect(mockTeardownAutocapture).toHaveBeenCalled();
    });
  });

  describe('consentMode: auto', () => {
    it('starts CMP detection when consentMode is auto', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });

      expect(mockStartCmpDetection).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('does not start CMP detection when consentMode is not auto', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

      expect(mockStartCmpDetection).not.toHaveBeenCalled();
    });

    it('starts at consent none and does not fire page view', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });

      // No events should be enqueued — waiting for CMP detection
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('fires page view when CMP detection upgrades consent', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });
      mockEnqueue.mockClear();

      // Simulate CMP detected with anonymous consent
      const onDetected = mockStartCmpDetection.mock.calls[0][1];
      onDetected({ source: 'gcm', level: 'anonymous', destroy: jest.fn() });

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.find((c) => c.type === 'page')).toBeDefined();
    });

    it('fires page view when CMP update callback upgrades from none', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });
      mockEnqueue.mockClear();

      // Simulate CMP update callback (ongoing consent change)
      const onUpdate = mockStartCmpDetection.mock.calls[0][0];
      onUpdate('anonymous', 'gcm');

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.find((c) => c.type === 'page')).toBeDefined();
    });

    it('does not fire duplicate page view on subsequent CMP updates', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });

      // First upgrade — fires page view
      const onUpdate = mockStartCmpDetection.mock.calls[0][0];
      onUpdate('anonymous', 'gcm');
      mockEnqueue.mockClear();

      // Second update (anonymous → full) — should NOT fire another page view
      onUpdate('full', 'gcm');
      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.find((c) => c.type === 'page')).toBeUndefined();
    });

    it('does not fire page view when CMP detects consent as none', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });
      mockEnqueue.mockClear();

      const onDetected = mockStartCmpDetection.mock.calls[0][1];
      onDetected({ source: 'gcm', level: 'none', destroy: jest.fn() });

      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('tears down CMP detection on destroy', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });

      pixel.destroy();
      expect(mockTeardownCmp).toHaveBeenCalled();
    });

    it('consentMode auto starts consent at none regardless of consent param', () => {
      const { createConsentManager } = jest.requireMock('@imtbl/audience-core') as {
        createConsentManager: jest.Mock;
      };
      createConsentManager.mockClear();

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({
        key: 'pk_imapik-test-local',
        consent: 'anonymous',
        consentMode: 'auto',
      });

      // consentMode: 'auto' should start at 'none' regardless of consent param
      expect(createConsentManager).toHaveBeenCalledWith(
        expect.anything(),
        'pk_imapik-test-local',
        'anon-123',
        'pixel',
        'none',
        undefined,
        undefined,
      );
    });

    it('setConsent fires deferred page view when CMP detection has not upgraded consent', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });

      // No page view yet — waiting for CMP
      expect(mockEnqueue).not.toHaveBeenCalled();
      mockEnqueue.mockClear();

      // Manually set consent as a fallback (e.g. CMP detection timed out)
      pixel.setConsent('anonymous');

      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.find((c) => c.type === 'page')).toBeDefined();
    });

    it('setConsent does not fire duplicate page view after CMP already upgraded', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consentMode: 'auto' });

      // CMP upgrades consent first
      const onUpdate = mockStartCmpDetection.mock.calls[0][0];
      onUpdate('anonymous', 'gcm');
      mockEnqueue.mockClear();

      // Manual setConsent should NOT fire another page view
      pixel.setConsent('full');
      const calls = mockEnqueue.mock.calls.map((c: unknown[]) => (c[0] as Record<string, unknown>));
      expect(calls.find((c) => c.type === 'page')).toBeUndefined();
    });
  });

  describe('autocapture integration', () => {
    it('sets up autocapture with default options on init', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

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
        key: 'pk_imapik-test-local',
        consent: 'anonymous',
        autocapture: { forms: false, clicks: true },
      });

      expect(mockSetupAutocapture).toHaveBeenCalledWith(
        { forms: false, clicks: true },
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('forwards scroll: false to setupAutocapture', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({
        key: 'pk_imapik-test-local',
        consent: 'anonymous',
        autocapture: { scroll: false },
      });

      expect(mockSetupAutocapture).toHaveBeenCalledWith(
        expect.objectContaining({ scroll: false }),
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('calls resetScroll when page() is called', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

      mockResetScrollDepth.mockClear();
      pixel.page();

      expect(mockResetScrollDepth).toHaveBeenCalledTimes(1);
    });

    it('enqueue callback fires TrackMessage with session', () => {
      mockGetOrCreateSession.mockReturnValue({ sessionId: 'session-xyz', isNew: false });

      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });
      mockEnqueue.mockClear();

      // Call the enqueue callback that was passed to setupAutocapture
      const enqueueCallback = mockSetupAutocapture.mock.calls[0][1] as (
        eventName: string,
        properties: Record<string, unknown>,
      ) => void;
      enqueueCallback('form_submitted', { form_action: '/signup' });

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'track',
          eventName: 'form_submitted',
          surface: 'pixel',
          sessionId: 'session-xyz',
          properties: expect.objectContaining({
            form_action: '/signup',
          }),
        }),
      );
    });

    it('consent callback returns current consent level', () => {
      const pixel = new Pixel();
      activePixel = pixel;
      pixel.init({ key: 'pk_imapik-test-local', consent: 'anonymous' });

      const getConsent = mockSetupAutocapture.mock.calls[0][2] as () => string;
      expect(getConsent()).toBe('anonymous');

      pixel.setConsent('full');
      expect(getConsent()).toBe('full');
    });
  });
});
