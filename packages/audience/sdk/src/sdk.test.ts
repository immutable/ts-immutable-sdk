import {
  COOKIE_NAME, SESSION_COOKIE, INGEST_PATH, CONSENT_PATH, SESSION_START, SESSION_END,
} from '@imtbl/audience-core';
import { Audience } from './sdk';
import { LIBRARY_NAME } from './config';

// --- Test fixtures ---
const TEST_USER = { uid: 'user@example.com', provider: 'email' } as const;
const TEST_STEAM = { uid: '76561198012345', provider: 'steam' } as const;

function createSDK(overrides: Record<string, unknown> = {}) {
  return Audience.init({
    publishableKey: 'pk_imtbl_test',
    environment: 'sandbox',
    consent: 'full',
    ...overrides,
  });
}

const originalLocation = window.location;
const fetchCalls: { url: string; init: RequestInit }[] = [];

const mockFetch = jest.fn().mockImplementation(
  async (url: string, init?: RequestInit) => {
    fetchCalls.push({ url: url as string, init: init ?? {} });
    return { ok: true, json: async () => ({}) };
  },
);
global.fetch = mockFetch;

function sentMessages(): any[] {
  return fetchCalls
    .filter((c) => c.url.includes(INGEST_PATH))
    .flatMap((c) => JSON.parse(c.init.body as string).messages);
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchCalls.length = 0;
  jest.useFakeTimers();
  document.cookie.split(';').forEach((c) => {
    document.cookie = `${c.trim().split('=')[0]}=;max-age=0;path=/`;
  });
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  // Reset instance counter so each test starts fresh
  (Audience as any).liveInstances = 0;
  jest.useRealTimers();
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true,
    configurable: true,
  });
});

describe('Audience', () => {
  describe('init', () => {
    it('creates an SDK instance via static init()', () => {
      const sdk = createSDK();
      expect(sdk).toBeInstanceOf(Audience);
      sdk.shutdown();
    });

    it('creates anonymous ID cookie when consent allows', () => {
      const sdk = createSDK({ consent: 'anonymous' });
      expect(document.cookie).toContain(`${COOKIE_NAME}=`);
      sdk.shutdown();
    });

    it('does not create identity cookies at none consent', () => {
      const sdk = createSDK({ consent: 'none' });
      expect(document.cookie).not.toContain(`${COOKIE_NAME}=`);
      sdk.shutdown();
    });

    it('throws if publishableKey is empty', () => {
      expect(() => Audience.init({
        publishableKey: '',
        environment: 'sandbox',
      })).toThrow('publishableKey is required');
    });

    it('throws if publishableKey is whitespace only', () => {
      expect(() => Audience.init({
        publishableKey: '  ',
        environment: 'sandbox',
      })).toThrow('publishableKey is required');
    });

    it('warns on double init but still creates a new instance', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const first = createSDK();
      const second = Audience.init({
        publishableKey: 'pk_imtbl_other',
        environment: 'production',
        consent: 'none',
      });

      expect(second).not.toBe(first);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Multiple SDK instances detected'),
      );

      warnSpy.mockRestore();
      first.shutdown();
      second.shutdown();
    });

    it('does not warn after previous instance is shut down', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const first = createSDK();
      first.shutdown();
      warnSpy.mockClear();

      const second = createSDK();
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Multiple SDK instances'),
      );

      warnSpy.mockRestore();
      second.shutdown();
    });

    it('emits session_start on new session', async () => {
      const sdk = createSDK({ consent: 'full' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === SESSION_START,
      );
      expect(msg).toBeDefined();
      expect(msg.properties).toHaveProperty('sessionId');

      sdk.shutdown();
    });

    it('includes attribution on session_start', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?utm_source=youtube&utm_campaign=launch',
          href: 'https://studio.com/?utm_source=youtube&utm_campaign=launch',
          protocol: 'https:',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });
      sessionStorage.clear();

      const sdk = createSDK({ consent: 'full' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === SESSION_START,
      );
      expect(msg).toBeDefined();
      expect(msg.properties).toHaveProperty('sessionId');
      expect(msg.properties).toHaveProperty('utm_source', 'youtube');
      expect(msg.properties).toHaveProperty('utm_campaign', 'launch');

      sdk.shutdown();
    });
  });

  describe('track', () => {
    it('enqueues an event and flushes', async () => {
      const sdk = createSDK();

      sdk.track('purchase', {
        currency: 'USD',
        value: 9.99,
        itemId: 'sword_01',
      });

      await sdk.flush();

      const msgs = sentMessages();
      const msg = msgs.find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );

      expect(msg).toBeDefined();
      expect(msg.properties).toEqual({
        currency: 'USD',
        value: 9.99,
        itemId: 'sword_01',
      });
      expect(msg.surface).toBe('web');
      expect(msg.context.library).toBe(LIBRARY_NAME);

      sdk.shutdown();
    });

    it('is a no-op at none consent', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();

      expect(sentMessages()).toHaveLength(0);
      sdk.shutdown();
    });

    it('excludes userId at anonymous consent', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.track('sign_in', { method: 'passport' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'sign_in',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBeUndefined();

      sdk.shutdown();
    });

    it('includes userId at full consent after identify', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(TEST_USER.uid, TEST_USER.provider);
      sdk.track('level_up', { level: 5 });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'level_up',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBe(TEST_USER.uid);

      sdk.shutdown();
    });
  });

  describe('page', () => {
    it('enqueues a page message', async () => {
      const sdk = createSDK();

      sdk.page({ section: 'shop' });
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg).toBeDefined();
      expect(msg.properties).toMatchObject({ section: 'shop' });

      sdk.shutdown();
    });

    it('is a no-op at none consent', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.page({ section: 'shop' });
      await sdk.flush();

      const pages = sentMessages().filter((m: any) => m.type === 'page');
      expect(pages).toHaveLength(0);

      sdk.shutdown();
    });

    it('excludes userId at anonymous consent', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.page({ section: 'shop' });
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg).toBeDefined();
      expect(msg.userId).toBeUndefined();

      sdk.shutdown();
    });

    it('includes userId at full consent after identify', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(TEST_USER.uid, TEST_USER.provider);
      sdk.page({ section: 'shop' });
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg).toBeDefined();
      expect(msg.userId).toBe(TEST_USER.uid);

      sdk.shutdown();
    });

    it('attaches attribution to the first page view', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?utm_source=youtube',
          href: 'https://studio.com/?utm_source=youtube',
          protocol: 'https:',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });
      sessionStorage.clear();

      const sdk = createSDK();
      sdk.page();
      sdk.page();
      await sdk.flush();

      const pages = sentMessages().filter(
        (m: any) => m.type === 'page',
      );
      expect(pages[0].properties).toHaveProperty(
        'utm_source',
        'youtube',
      );
      if (pages[1]) {
        expect(pages[1].properties?.utm_source).toBeUndefined();
      }

      sdk.shutdown();
    });
  });

  describe('identify', () => {
    it('sends an identify message at full consent', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(TEST_USER.uid, TEST_USER.provider, {
        name: 'Player One',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'identify',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBe(TEST_USER.uid);
      expect(msg.identityType).toBe(TEST_USER.provider);
      expect(msg.traits).toEqual({ name: 'Player One' });

      sdk.shutdown();
    });

    it('is a no-op at none consent', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.identify(TEST_USER.uid, TEST_USER.provider);
      await sdk.flush();

      const ids = sentMessages().filter((m: any) => m.type === 'identify');
      expect(ids).toHaveLength(0);

      sdk.shutdown();
    });

    it('is a no-op at anonymous consent', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.identify(TEST_USER.uid, TEST_USER.provider);
      await sdk.flush();

      const ids = sentMessages().filter(
        (m: any) => m.type === 'identify',
      );
      expect(ids).toHaveLength(0);
      sdk.shutdown();
    });

    it('ignores null passed as traits', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(null as any);
      await sdk.flush();

      const ids = sentMessages().filter((m: any) => m.type === 'identify');
      // null is not a valid traits object — should not enqueue
      expect(ids).toHaveLength(0);

      sdk.shutdown();
    });

    it('ignores array passed as traits', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(['not', 'traits'] as any);
      await sdk.flush();

      const ids = sentMessages().filter((m: any) => m.type === 'identify');
      expect(ids).toHaveLength(0);

      sdk.shutdown();
    });

    it('sends anonymous identify with traits only', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify({
        source: 'steam',
        steamId: TEST_STEAM.uid,
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'identify',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBeUndefined();
      expect(msg.traits).toEqual({
        source: 'steam',
        steamId: TEST_STEAM.uid,
      });

      sdk.shutdown();
    });
  });

  describe('alias', () => {
    it('sends alias with fromId/fromType/toId/toType', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.alias(TEST_STEAM, TEST_USER);
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'alias',
      );
      expect(msg).toBeDefined();
      expect(msg.fromId).toBe(TEST_STEAM.uid);
      expect(msg.fromType).toBe(TEST_STEAM.provider);
      expect(msg.toId).toBe(TEST_USER.uid);
      expect(msg.toType).toBe(TEST_USER.provider);

      sdk.shutdown();
    });

    it('rejects alias when from and to are identical', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.alias(
        { uid: 'same_id', provider: 'steam' },
        { uid: 'same_id', provider: 'steam' },
      );
      await sdk.flush();

      const aliases = sentMessages().filter((m: any) => m.type === 'alias');
      expect(aliases).toHaveLength(0);

      sdk.shutdown();
    });

    it('is a no-op at none consent', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.alias(TEST_STEAM, TEST_USER);
      await sdk.flush();

      const aliases = sentMessages().filter((m: any) => m.type === 'alias');
      expect(aliases).toHaveLength(0);

      sdk.shutdown();
    });

    it('is a no-op at anonymous consent', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.alias(TEST_STEAM, TEST_USER);
      await sdk.flush();

      const aliases = sentMessages().filter((m: any) => m.type === 'alias');
      expect(aliases).toHaveLength(0);

      sdk.shutdown();
    });
  });

  describe('setConsent', () => {
    it('is a no-op when setting the same level', async () => {
      const sdk = createSDK({ consent: 'full' });
      await sdk.flush();
      fetchCalls.length = 0;

      sdk.setConsent('full');
      await sdk.flush();

      // No consent sync PUT should fire for same-level call
      const consentCalls = fetchCalls.filter(
        (c) => c.url.includes(CONSENT_PATH),
      );
      expect(consentCalls).toHaveLength(0);

      sdk.shutdown();
    });

    it('creates cookies and enables tracking on upgrade from none to full', async () => {
      const sdk = createSDK({ consent: 'none' });
      expect(document.cookie).not.toContain(`${COOKIE_NAME}=`);

      sdk.setConsent('full');
      expect(document.cookie).toContain(`${COOKIE_NAME}=`);

      sdk.identify(TEST_USER.uid, TEST_USER.provider);
      sdk.track('purchase', { value: 9.99 });
      await sdk.flush();

      const trackMsg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );
      expect(trackMsg).toBeDefined();
      expect(trackMsg.userId).toBe(TEST_USER.uid);

      sdk.shutdown();
    });

    it('starts queue and emits session_start when upgrading from none', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();
      expect(sentMessages()).toHaveLength(0);

      sdk.setConsent('anonymous');
      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();

      const msgs = sentMessages();
      const sessionStart = msgs.find(
        (m: any) => m.type === 'track' && m.eventName === SESSION_START,
      );
      expect(sessionStart).toBeDefined();
      expect(sessionStart.properties).toHaveProperty('sessionId');

      const signUp = msgs.find(
        (m: any) => m.type === 'track' && m.eventName === 'sign_up',
      );
      expect(signUp).toBeDefined();

      sdk.shutdown();
    });

    it('purges identify/alias, strips userId on downgrade', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(TEST_USER.uid, TEST_USER.provider);
      sdk.alias(TEST_STEAM, TEST_USER);
      sdk.track('purchase', { currency: 'USD', value: 9.99 });

      sdk.setConsent('anonymous');
      await sdk.flush();

      const msgs = sentMessages();
      expect(
        msgs.every((m: any) => m.type !== 'identify'),
      ).toBe(true);
      expect(
        msgs.every((m: any) => m.type !== 'alias'),
      ).toBe(true);
      const trackMsg = msgs.find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );
      expect(trackMsg).toBeDefined();
      expect(trackMsg.userId).toBeUndefined();

      sdk.shutdown();
    });

    it('clears identity cookies on downgrade to none', () => {
      const sdk = createSDK({ consent: 'anonymous' });
      expect(document.cookie).toContain(`${COOKIE_NAME}=`);
      expect(document.cookie).toContain(`${SESSION_COOKIE}=`);

      sdk.setConsent('none');
      expect(document.cookie).not.toContain(`${COOKIE_NAME}=`);
      expect(document.cookie).not.toContain(`${SESSION_COOKIE}=`);

      sdk.shutdown();
    });

    it('stops queue and makes track no-op on anonymous to none downgrade', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.track('before', { step: 1 });
      await sdk.flush();
      const beforeMsgs = sentMessages().filter(
        (m: any) => m.type === 'track' && m.eventName === 'before',
      );
      expect(beforeMsgs.length).toBeGreaterThan(0);
      fetchCalls.length = 0;

      sdk.setConsent('none');
      sdk.track('after', { step: 2 });
      await sdk.flush();

      const afterMsgs = sentMessages().filter(
        (m: any) => m.type === 'track' && m.eventName === 'after',
      );
      expect(afterMsgs).toHaveLength(0);

      sdk.shutdown();
    });

    it('re-attaches attribution after consent downgrade and re-upgrade', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?utm_source=tiktok',
          href: 'https://studio.com/?utm_source=tiktok',
          protocol: 'https:',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });
      sessionStorage.clear();

      const sdk = createSDK({ consent: 'anonymous' });
      sdk.page();
      await sdk.flush();
      fetchCalls.length = 0;

      // Downgrade then re-upgrade
      sdk.setConsent('none');
      sdk.setConsent('anonymous');
      sdk.page();
      await sdk.flush();

      const pages = sentMessages().filter((m: any) => m.type === 'page');
      expect(pages[0]?.properties).toHaveProperty('utm_source', 'tiktok');

      sdk.shutdown();
    });
  });

  describe('shutdown', () => {
    it('emits session_end with duration', async () => {
      const sdk = createSDK({ consent: 'full' });
      await sdk.flush();
      fetchCalls.length = 0;

      jest.advanceTimersByTime(5000);
      sdk.shutdown();

      // destroy() calls flushUnload() which fires a keepalive fetch synchronously.
      // Yield to ensure all microtasks settle before reading fetchCalls.
      await Promise.resolve();
      await Promise.resolve();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === SESSION_END,
      );
      expect(msg).toBeDefined();
      expect(msg.properties).toHaveProperty('sessionId');
      expect(msg.properties.duration).toBe(5);
    });

    it('does not emit session_end at none consent', async () => {
      const sdk = createSDK({ consent: 'none' });
      sdk.shutdown();

      expect(sentMessages().filter(
        (m: any) => m.eventName === SESSION_END,
      )).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('clears pending messages from the queue', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.track('before_reset', { step: 1 });
      sdk.reset();
      await sdk.flush();

      const msgs = sentMessages().filter(
        (m: any) => m.type === 'track' && m.eventName === 'before_reset',
      );
      expect(msgs).toHaveLength(0);

      sdk.shutdown();
    });

    it('clears userId and generates new anonymousId', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.track('sign_in', { method: 'passport' });
      await sdk.flush();
      const originalAnonId = sentMessages().find(
        (m: any) => m.type === 'track',
      )?.anonymousId;
      fetchCalls.length = 0;

      sdk.identify(TEST_USER.uid, TEST_USER.provider);
      await sdk.flush();
      fetchCalls.length = 0;

      sdk.reset();
      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBeUndefined();
      expect(msg.anonymousId).toBeDefined();
      expect(msg.anonymousId).not.toBe(originalAnonId);

      sdk.shutdown();
    });

    it('emits session_start after reset', async () => {
      const sdk = createSDK({ consent: 'full' });
      await sdk.flush();
      fetchCalls.length = 0;

      sdk.reset();
      await sdk.flush();

      const sessionStarts = sentMessages().filter(
        (m: any) => m.type === 'track' && m.eventName === SESSION_START,
      );
      expect(sessionStarts).toHaveLength(1);

      sdk.shutdown();
    });

    it('works at none consent without creating cookies', () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.reset();
      expect(document.cookie).not.toContain(`${COOKIE_NAME}=`);
      expect(document.cookie).not.toContain(`${SESSION_COOKIE}=`);

      sdk.shutdown();
    });
  });
});
