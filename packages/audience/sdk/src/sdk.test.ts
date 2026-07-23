import {
  COOKIE_NAME, SESSION_COOKIE,
} from '@imtbl/audience-core';
import { track } from '@imtbl/metrics';
import { Audience } from './sdk';
import { LIBRARY_NAME } from './config';

jest.mock('@imtbl/metrics', () => ({
  track: jest.fn(),
  trackError: jest.fn(),
}));

const INGEST_PATH = '/v1/audience/messages';
const CONSENT_PATH = '/v1/audience/tracking-consent';
const DATA_PATH = '/v1/audience/data';

// --- Test fixtures ---
const TEST_USER = { id: 'user@example.com', identityType: 'email' } as const;
const TEST_STEAM = { id: '76561198012345', identityType: 'steam' } as const;

function createSDK(overrides: Record<string, unknown> = {}) {
  return Audience.init({
    publishableKey: 'pk_imapik-test-local',
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
      })).toThrow('publishableKey is required');
    });

    it('throws if publishableKey is whitespace only', () => {
      expect(() => Audience.init({
        publishableKey: '  ',
      })).toThrow('publishableKey is required');
    });

    it('warns on double init but still creates a new instance', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const first = createSDK();
      const second = Audience.init({
        publishableKey: 'pk_imapik-test-other',
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

    it('adopts imtbl_aid from URL and uses it as the anonymous ID', () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?imtbl_aid=a1b2c3d4-e5f6-7890-abcd-ef1234567890&foo=bar',
          pathname: '/games/devilfish',
          hash: '',
        },
        writable: true,
        configurable: true,
      });

      const sdk = createSDK({ consent: 'anonymous' });
      expect(sdk.getAnonymousId()).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      sdk.shutdown();
    });

    it('adopted imtbl_aid is used in outgoing events', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?imtbl_aid=a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          pathname: '/games/devilfish',
          hash: '',
        },
        writable: true,
        configurable: true,
      });

      const sdk = createSDK({ consent: 'anonymous' });
      sdk.page();
      await sdk.flush();

      const msg = sentMessages().find((m) => m.type === 'page');
      expect(msg?.anonymousId).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      sdk.shutdown();
    });

    it('strips imtbl_aid from the URL after init, preserving other params', () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState');
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?imtbl_aid=a1b2c3d4-e5f6-7890-abcd-ef1234567890&foo=bar',
          pathname: '/games/devilfish',
          hash: '',
        },
        writable: true,
        configurable: true,
      });

      const sdk = createSDK({ consent: 'anonymous' });
      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/games/devilfish?foo=bar');
      replaceStateSpy.mockRestore();
      sdk.shutdown();
    });

    it('strips imtbl_aid with no trailing ? when it is the only param', () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState');
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?imtbl_aid=a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          pathname: '/games/devilfish',
          hash: '',
        },
        writable: true,
        configurable: true,
      });

      const sdk = createSDK({ consent: 'anonymous' });
      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/games/devilfish');
      replaceStateSpy.mockRestore();
      sdk.shutdown();
    });

    it('strips imtbl_aid at none consent too', () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState');
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?imtbl_aid=a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          pathname: '/games/devilfish',
          hash: '',
        },
        writable: true,
        configurable: true,
      });

      const sdk = createSDK({ consent: 'none' });
      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/games/devilfish');
      replaceStateSpy.mockRestore();
      sdk.shutdown();
    });

    it.each([
      ['empty string', '?imtbl_aid='],
      ['non-UUID string', '?imtbl_aid=not-a-uuid'],
      ['excessively long string', `?imtbl_aid=${'a'.repeat(300)}`],
    ])('strips but does not adopt invalid imtbl_aid: %s', (_, search) => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState');
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search,
          pathname: '/games/devilfish',
          hash: '',
        },
        writable: true,
        configurable: true,
      });

      const sdk = createSDK({ consent: 'anonymous' });
      expect(sdk.getAnonymousId()).not.toMatch(/^not-a-uuid$|^a{300}$/);
      expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/games/devilfish');
      replaceStateSpy.mockRestore();
      sdk.shutdown();
    });

    it('ignores imtbl_aid at none consent', () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?imtbl_aid=a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          pathname: '/games/devilfish',
          hash: '',
        },
        writable: true,
        configurable: true,
      });

      const sdk = createSDK({ consent: 'none' });
      expect(sdk.getAnonymousId()).not.toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      sdk.shutdown();
    });
  });

  describe('getAnonymousId', () => {
    it('returns the anonymous ID after init', () => {
      const sdk = createSDK({ consent: 'anonymous' });
      expect(typeof sdk.getAnonymousId()).toBe('string');
      expect(sdk.getAnonymousId().length).toBeGreaterThan(0);
      sdk.shutdown();
    });

    it('returns the same ID used in outgoing events', async () => {
      const sdk = createSDK({ consent: 'anonymous' });
      const aid = sdk.getAnonymousId();

      sdk.page();
      await sdk.flush();

      const msg = sentMessages().find((m) => m.type === 'page');
      expect(msg?.anonymousId).toBe(aid);
      sdk.shutdown();
    });
  });

  describe('track', () => {
    it('enqueues an event and flushes', async () => {
      const sdk = createSDK();

      sdk.track('purchase', {
        currency: 'USD',
        value: 9.99,
        item_id: 'sword_01',
      });

      await sdk.flush();

      const msgs = sentMessages();
      const msg = msgs.find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );

      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        currency: 'USD',
        value: 9.99,
        item_id: 'sword_01',
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

      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      sdk.track('level_up', { level: 5 });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'level_up',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBe(TEST_USER.id);

      sdk.shutdown();
    });

    it('enqueues sign_up with method property and sessionId', async () => {
      const sdk = createSDK();

      sdk.track('sign_up', { method: 'email' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'sign_up',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      // sign_up carries session-cached attribution, which includes landing_page
      // (a session-start concept, collectPageAttribution() never set this).
      expect(msg.properties).toEqual({
        method: 'email',
        landing_page: expect.any(String),
      });

      sdk.shutdown();
    });

    it('enqueues game_launch with optional fields', async () => {
      const sdk = createSDK();

      sdk.track('game_launch', {
        platform: 'webgl',
        version: '1.2.0',
        build_id: 'ci-42',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'game_launch',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        platform: 'webgl',
        version: '1.2.0',
        build_id: 'ci-42',
      });

      sdk.shutdown();
    });

    it('enqueues progression with status and optional gameplay fields', async () => {
      const sdk = createSDK();

      sdk.track('progression', {
        status: 'complete',
        world: 'forest',
        level: '5',
        stage: 'boss',
        score: 420,
        duration_sec: 87,
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'progression',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        status: 'complete',
        world: 'forest',
        level: '5',
        stage: 'boss',
        score: 420,
        duration_sec: 87,
      });

      sdk.shutdown();
    });

    it('enqueues achievement_unlocked with required fields', async () => {
      const sdk = createSDK();

      sdk.track('achievement_unlocked', {
        achievement_id: 'first_win',
        achievement_name: 'First Win',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'achievement_unlocked',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        achievement_id: 'first_win',
        achievement_name: 'First Win',
      });

      sdk.shutdown();
    });

    it('enqueues achievement_unlocked with optional achievement_type', async () => {
      const sdk = createSDK();

      sdk.track('achievement_unlocked', {
        achievement_id: 'tutorial_done',
        achievement_name: 'Tutorial Complete',
        achievement_type: 'onboarding',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'achievement_unlocked',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        achievement_id: 'tutorial_done',
        achievement_name: 'Tutorial Complete',
        achievement_type: 'onboarding',
      });

      sdk.shutdown();
    });

    it('enqueues resource with flow, currency, and amount', async () => {
      const sdk = createSDK();

      sdk.track('resource', {
        flow: 'source',
        currency: 'gold',
        amount: 50,
        item_type: 'quest_reward',
        item_id: 'quest_42',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'resource',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        flow: 'source',
        currency: 'gold',
        amount: 50,
        item_type: 'quest_reward',
        item_id: 'quest_42',
      });

      sdk.shutdown();
    });

    it('enqueues wishlist_add with gameId and optional fields', async () => {
      const sdk = createSDK();

      sdk.track('wishlist_add', {
        game_id: 'devilfish',
        source: 'game_page',
        platform: 'steam',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'wishlist_add',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        game_id: 'devilfish',
        source: 'game_page',
        platform: 'steam',
      });

      sdk.shutdown();
    });

    it('attaches UTM attribution to sign_up events', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?utm_source=google&utm_campaign=spring',
          href: 'https://studio.com/?utm_source=google&utm_campaign=spring',
          protocol: 'https:',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });
      sessionStorage.clear();

      const sdk = createSDK();
      sdk.track('sign_up', { method: 'passport' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'sign_up',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        utm_source: 'google',
        utm_campaign: 'spring',
        touchpoint_type: 'click',
        landing_page: expect.any(String),
        method: 'passport',
      });

      sdk.shutdown();
    });

    it('attaches UTM attribution to link_clicked events', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?utm_source=twitter',
          href: 'https://studio.com/?utm_source=twitter',
          protocol: 'https:',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });
      sessionStorage.clear();

      const sdk = createSDK();
      sdk.track('link_clicked', { url: 'https://store.com', label: 'Buy' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'link_clicked',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        utm_source: 'twitter',
        touchpoint_type: 'click',
        landing_page: expect.any(String),
        url: 'https://store.com',
        label: 'Buy',
      });

      sdk.shutdown();
    });

    it('keeps UTM attribution on link_clicked/sign_up after the URL loses its query params', async () => {
      // Regression test: attribution must come from the session-cached snapshot
      // (captured at construction), not be re-parsed from the current URL:
      // otherwise a user who lands via a UTM'd ad, browses a few pages, then
      // clicks a link loses attribution the moment the URL no longer has it.
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

      const sdk = createSDK();

      // Simulate navigating to a later page with no UTM params in the URL.
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '',
          href: 'https://studio.com/games/devilfish',
          protocol: 'https:',
          pathname: '/games/devilfish',
        },
        writable: true,
        configurable: true,
      });

      sdk.track('link_clicked', { url: 'https://store.com', label: 'Buy' });
      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();

      const linkMsg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'link_clicked',
      );
      const signUpMsg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'sign_up',
      );
      expect(linkMsg?.properties).toHaveProperty('utm_source', 'tiktok');
      expect(signUpMsg?.properties).toHaveProperty('utm_source', 'tiktok');

      sdk.shutdown();
    });

    it('does not attach UTM attribution to other track events', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?utm_source=google',
          href: 'https://studio.com/?utm_source=google',
          protocol: 'https:',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });
      sessionStorage.clear();

      const sdk = createSDK();
      sdk.track('purchase', { currency: 'USD', value: 9.99 });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        currency: 'USD',
        value: 9.99,
      });

      sdk.shutdown();
    });

    it('includes sessionId on all track events', async () => {
      const sdk = createSDK();

      sdk.track('game_launch', { platform: 'webgl' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'game_launch',
      );
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        platform: 'webgl',
      });

      sdk.shutdown();
    });

    it('picks up a session rollover on the next call instead of keeping a stale id', async () => {
      const sdk = createSDK();

      sdk.track('purchase', { currency: 'USD', value: 1 });
      await sdk.flush();
      const firstSessionId = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      ).sessionId;

      // Simulate the session cookie expiring (30 min idle) before the next call.
      document.cookie = `${SESSION_COOKIE}=;max-age=0;path=/`;

      sdk.track('purchase', { currency: 'USD', value: 2 });
      await sdk.flush();

      const purchases = sentMessages().filter(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );

      expect(purchases[1].sessionId).toEqual(expect.any(String));
      expect(purchases[1].sessionId).not.toBe(firstSessionId);

      sdk.shutdown();
    });

    it('throws when the event name is empty', async () => {
      const sdk = createSDK();

      expect(() => sdk.track('')).toThrow(/empty event name/);
      await sdk.flush();
      expect(sentMessages().filter((m: any) => m.type === 'track')).toHaveLength(0);

      sdk.shutdown();
    });

    describe('reserved event required properties', () => {
      it('throws when purchase is missing currency and value', async () => {
        const sdk = createSDK();

        // @ts-expect-error deliberately bypassing the compile-time check
        expect(() => sdk.track('purchase', {})).toThrow(/missing required properties: currency, value/);
        await sdk.flush();
        expect(sentMessages().filter((m: any) => m.type === 'track')).toHaveLength(0);

        sdk.shutdown();
      });

      it('throws when progression is missing status', async () => {
        const sdk = createSDK();

        // @ts-expect-error deliberately bypassing the compile-time check
        expect(() => sdk.track('progression', {})).toThrow(/missing required property: status/);

        sdk.shutdown();
      });

      it('throws when resource is missing flow, currency, and amount', async () => {
        const sdk = createSDK();

        // @ts-expect-error deliberately bypassing the compile-time check
        expect(() => sdk.track('resource', {})).toThrow(/missing required properties: flow, currency, amount/);

        sdk.shutdown();
      });

      it('throws when achievement_unlocked is missing achievement_id and achievement_name', async () => {
        const sdk = createSDK();

        // @ts-expect-error deliberately bypassing the compile-time check
        expect(() => sdk.track('achievement_unlocked', {})).toThrow(
          /missing required properties: achievement_id, achievement_name/,
        );

        sdk.shutdown();
      });

      it('throws when wishlist_add is missing game_id', async () => {
        const sdk = createSDK();

        // @ts-expect-error deliberately bypassing the compile-time check
        expect(() => sdk.track('wishlist_add', {})).toThrow(/missing required property: game_id/);

        sdk.shutdown();
      });

      it('throws when wishlist_remove is missing game_id', async () => {
        const sdk = createSDK();

        // @ts-expect-error deliberately bypassing the compile-time check
        expect(() => sdk.track('wishlist_remove', {})).toThrow(/missing required property: game_id/);

        sdk.shutdown();
      });

      it('throws when game_page_viewed is missing game_id', async () => {
        const sdk = createSDK();

        // @ts-expect-error deliberately bypassing the compile-time check
        expect(() => sdk.track('game_page_viewed', {})).toThrow(/missing required property: game_id/);

        sdk.shutdown();
      });

      it('does not throw when all required properties are present', async () => {
        const sdk = createSDK();

        expect(() => sdk.track('purchase', { currency: 'USD', value: 9.99 })).not.toThrow();
        expect(() => sdk.track('progression', { status: 'start' })).not.toThrow();
        expect(() => sdk.track('resource', { flow: 'source', currency: 'gold', amount: 10 })).not.toThrow();
        expect(() => sdk.track('achievement_unlocked', {
          achievement_id: 'a1',
          achievement_name: 'First Steps',
        })).not.toThrow();
        expect(() => sdk.track('wishlist_add', { game_id: 'abc' })).not.toThrow();
        expect(() => sdk.track('wishlist_remove', { game_id: 'abc' })).not.toThrow();
        expect(() => sdk.track('game_page_viewed', { game_id: 'abc' })).not.toThrow();
        expect(() => sdk.track('link_clicked', { url: 'https://example.com' })).not.toThrow();

        sdk.shutdown();
      });

      it('does not throw for events with no required properties', async () => {
        const sdk = createSDK();

        expect(() => sdk.track('sign_up')).not.toThrow();
        expect(() => sdk.track('sign_in')).not.toThrow();
        expect(() => sdk.track('game_launch')).not.toThrow();
        expect(() => sdk.track('email_acquired')).not.toThrow();
        expect(() => sdk.track('button_clicked')).not.toThrow();
        // link_clicked isn't enforced at runtime; see REQUIRED_EVENT_PROPS in events.ts.
        // @ts-expect-error deliberately bypassing the compile-time check
        expect(() => sdk.track('link_clicked', {})).not.toThrow();

        sdk.shutdown();
      });

      it('does not validate unrecognised event names', async () => {
        const sdk = createSDK();

        expect(() => sdk.track('some_custom_event', {})).not.toThrow();

        sdk.shutdown();
      });
    });
  });

  describe('page', () => {
    it('enqueues a page message', async () => {
      const sdk = createSDK();

      sdk.page({ section: 'shop' });
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg).toBeDefined();
      // First page merges session-cached attribution (includes landing_page)
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        landing_page: expect.any(String),
        section: 'shop',
      });

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

      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      sdk.page({ section: 'shop' });
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg).toBeDefined();
      expect(msg.userId).toBe(TEST_USER.id);

      sdk.shutdown();
    });

    it('attaches attribution to the first page view only', async () => {
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

    it('attaches third-party IDs (ga/fbc/fbp) to page views, matching pixel', async () => {
      document.cookie = '_ga=GA1.2.111.222; path=/';
      document.cookie = '_fbc=fb.1.333.444; path=/';
      document.cookie = '_fbp=fb.1.555.666; path=/';

      const sdk = createSDK();
      sdk.page();
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg?.properties).toMatchObject({
        ga_client_id: 'GA1.2.111.222',
        fb_click_id: 'fb.1.333.444',
        fb_browser_id: 'fb.1.555.666',
      });

      sdk.shutdown();
    });

    it('lets caller-supplied properties win over third-party IDs on key collision, matching pixel', async () => {
      document.cookie = '_ga=GA1.2.111.222; path=/';

      const sdk = createSDK();
      sdk.page({ ga_client_id: 'caller-override' });
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg?.properties).toMatchObject({ ga_client_id: 'caller-override' });

      sdk.shutdown();
    });

    it('includes sessionId in page properties', async () => {
      const sdk = createSDK();

      sdk.page();
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg).toBeDefined();
      expect(msg.sessionId).toEqual(expect.any(String));
      expect(msg.properties).toEqual({
        landing_page: expect.any(String),
      });

      sdk.shutdown();
    });
  });

  describe('consent level', () => {
    it('stamps the anonymous consent level on every emitted message', async () => {
      const sdk = createSDK({ consent: 'anonymous' });
      sdk.page();
      sdk.track('purchase', { currency: 'USD', value: 1 });
      await sdk.flush();

      const msgs = sentMessages();
      expect(msgs.length).toBeGreaterThan(0);
      msgs.forEach((m: any) => expect(m.consentLevel).toBe('anonymous'));

      sdk.shutdown();
    });

    it('stamps full consent, carrying userId once identified', async () => {
      const sdk = createSDK({ consent: 'full' });
      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      sdk.page();
      await sdk.flush();

      const idMsg = sentMessages().find((m: any) => m.type === 'identify');
      expect(idMsg.consentLevel).toBe('full');
      expect(idMsg.userId).toBe(TEST_USER.id);

      const pageMsg = sentMessages().find((m: any) => m.type === 'page');
      expect(pageMsg.consentLevel).toBe('full');
      expect(pageMsg.userId).toBe(TEST_USER.id);

      sdk.shutdown();
    });

    it('leaves queued events with their capture-time consentLevel and userId on downgrade from full', async () => {
      const sdk = createSDK({ consent: 'full' });
      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      sdk.track('purchase', { currency: 'USD', value: 9.99 });

      sdk.setConsent('anonymous');
      await sdk.flush();

      // The purchase was recorded under full consent; the downgrade must not
      // retro-actively rewrite it, so it still reports full + userId.
      const trackMsg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );
      expect(trackMsg).toBeDefined();
      expect(trackMsg.consentLevel).toBe('full');
      expect(trackMsg.userId).toBe(TEST_USER.id);

      sdk.shutdown();
    });
  });

  describe('session id', () => {
    it('stamps sessionId at the top level on every message type, including identify and alias', async () => {
      const sdk = createSDK({ consent: 'full' });
      sdk.page();
      sdk.track('purchase', { currency: 'USD', value: 1 });
      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      sdk.alias(TEST_STEAM, TEST_USER);
      await sdk.flush();

      const msgs = sentMessages();
      expect(msgs.length).toBeGreaterThan(0);
      msgs.forEach((m: any) => expect(m.sessionId).toEqual(expect.any(String)));

      const pageMsg = msgs.find((m: any) => m.type === 'page');
      const idMsg = msgs.find((m: any) => m.type === 'identify');
      const aliasMsg = msgs.find((m: any) => m.type === 'alias');
      // identify/alias have no `properties` field, so sessionId is only ever visible at the top level.
      expect(idMsg.sessionId).toBe(pageMsg.sessionId);
      expect(aliasMsg.sessionId).toBe(pageMsg.sessionId);

      sdk.shutdown();
    });
  });

  describe('identify', () => {
    it('sends an identify message at full consent', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(TEST_USER.id, TEST_USER.identityType, {
        name: 'Player One',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'identify',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBe(TEST_USER.id);
      expect(msg.identityType).toBe(TEST_USER.identityType);
      expect(msg.traits).toEqual({ name: 'Player One' });

      sdk.shutdown();
    });

    it('is a no-op at none consent', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      await sdk.flush();

      const ids = sentMessages().filter((m: any) => m.type === 'identify');
      expect(ids).toHaveLength(0);

      sdk.shutdown();
    });

    it('is a no-op at anonymous consent', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      await sdk.flush();

      const ids = sentMessages().filter(
        (m: any) => m.type === 'identify',
      );
      expect(ids).toHaveLength(0);
      sdk.shutdown();
    });

    it('throws when identityType is passport but the id is not passport shaped', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.identify('12345', 'passport')).toThrow(/doesn't look like a/);
      await sdk.flush();
      const ids = sentMessages().filter((m: any) => m.type === 'identify');
      expect(ids).toHaveLength(0);

      sdk.shutdown();
    });

    it('does not persist userId after a rejected passport identify, so later track calls stay anonymous', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.identify('12345', 'passport')).toThrow();
      sdk.track('sign_up', { method: 'email' });
      await sdk.flush();

      const trackMsg = sentMessages().find((m: any) => m.eventName === 'sign_up');
      expect(trackMsg.userId).toBeUndefined();

      sdk.shutdown();
    });

    it('does not throw for a passport shaped id', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.identify('email|abc123', 'passport')).not.toThrow();
      await sdk.flush();
      const msg = sentMessages().find((m: any) => m.type === 'identify');
      expect(msg).toBeDefined();

      sdk.shutdown();
    });

    it('does not throw for a bare UUID passport id', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.identify('550e8400-e29b-41d4-a716-446655440000', 'passport')).not.toThrow();
      await sdk.flush();
      const msg = sentMessages().find((m: any) => m.type === 'identify');
      expect(msg).toBeDefined();

      sdk.shutdown();
    });

    it('stores and sends the trimmed id, not the padded one, for a valid passport id', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(' email|abc123\n', 'passport');
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'identify');
      expect(msg.userId).toBe('email|abc123');

      sdk.shutdown();
    });

    it('does not throw for non-passport identity types regardless of id shape', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.identify('12345', 'steam')).not.toThrow();
      await sdk.flush();
      const msg = sentMessages().find((m: any) => m.type === 'identify');
      expect(msg).toBeDefined();

      sdk.shutdown();
    });

    it('throws when id is empty', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.identify('', 'steam')).toThrow(/empty id/);
      await sdk.flush();
      expect(sentMessages().filter((m: any) => m.type === 'identify')).toHaveLength(0);

      sdk.shutdown();
    });

    it('throws when identityType is not recognised', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.identify('player-1', 'facebook' as never)).toThrow(/unrecognised identityType/);
      await sdk.flush();
      expect(sentMessages().filter((m: any) => m.type === 'identify')).toHaveLength(0);

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
      expect(msg.fromId).toBe(TEST_STEAM.id);
      expect(msg.fromType).toBe(TEST_STEAM.identityType);
      expect(msg.toId).toBe(TEST_USER.id);
      expect(msg.toType).toBe(TEST_USER.identityType);

      sdk.shutdown();
    });

    it('throws when from and to are identical', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.alias(
        { id: 'same_id', identityType: 'steam' },
        { id: 'same_id', identityType: 'steam' },
      )).toThrow(/from and to are identical/);
      await sdk.flush();

      const aliases = sentMessages().filter((m: any) => m.type === 'alias');
      expect(aliases).toHaveLength(0);

      sdk.shutdown();
    });

    it('throws when the ids match even if identityType differs, matching the backend', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.alias(
        { id: 'same_id', identityType: 'steam' },
        { id: 'same_id', identityType: 'email' },
      )).toThrow(/from and to are identical/);
      await sdk.flush();

      const aliases = sentMessages().filter((m: any) => m.type === 'alias');
      expect(aliases).toHaveLength(0);

      sdk.shutdown();
    });

    it('throws when from.id or to.id is empty', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.alias({ id: '', identityType: 'steam' }, TEST_USER)).toThrow(/empty from.id or to.id/);
      await sdk.flush();
      expect(sentMessages().filter((m: any) => m.type === 'alias')).toHaveLength(0);

      sdk.shutdown();
    });

    it('throws when either identityType is not recognised', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.alias({ id: 'fb-id', identityType: 'facebook' as never }, TEST_USER))
        .toThrow(/unrecognised identityType/);
      await sdk.flush();
      expect(sentMessages().filter((m: any) => m.type === 'alias')).toHaveLength(0);

      sdk.shutdown();
    });

    it('throws when to.identityType is passport but to.id is not passport shaped', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.alias(TEST_STEAM, { id: '12345', identityType: 'passport' }))
        .toThrow(/doesn't look like a/);
      await sdk.flush();
      const aliases = sentMessages().filter((m: any) => m.type === 'alias');
      expect(aliases).toHaveLength(0);

      sdk.shutdown();
    });

    it('throws when from.identityType is passport but from.id is not passport shaped', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.alias({ id: '12345', identityType: 'passport' }, TEST_STEAM))
        .toThrow(/doesn't look like a/);
      await sdk.flush();
      const aliases = sentMessages().filter((m: any) => m.type === 'alias');
      expect(aliases).toHaveLength(0);

      sdk.shutdown();
    });

    it('does not throw when the passport side has a passport-shaped id', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.alias(TEST_STEAM, { id: 'email|abc123', identityType: 'passport' })).not.toThrow();
      await sdk.flush();
      const msg = sentMessages().find((m: any) => m.type === 'alias');
      expect(msg).toBeDefined();

      sdk.shutdown();
    });

    it('stores and sends the trimmed id, not the padded one, for a valid passport id', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.alias(TEST_STEAM, { id: ' email|abc123\n', identityType: 'passport' });
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'alias');
      expect(msg.toId).toBe('email|abc123');

      sdk.shutdown();
    });

    it('does not throw when neither side is passport, regardless of id shape', async () => {
      const sdk = createSDK({ consent: 'full' });

      expect(() => sdk.alias({ id: '12345', identityType: 'steam' }, { id: '67890', identityType: 'epic' }))
        .not.toThrow();
      await sdk.flush();
      const msg = sentMessages().find((m: any) => m.type === 'alias');
      expect(msg).toBeDefined();

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

  describe('identify and alias type narrowing', () => {
    it('rejects invalid identityType at compile time', () => {
      const sdk = createSDK({ consent: 'full' });

      // Valid — should type-check.
      sdk.identify('email|player-1', 'passport', { plan: 'premium' });

      // @ts-expect-error — 'facebook' is not a valid IdentityType literal.
      expect(() => sdk.identify('player-2', 'facebook')).toThrow();

      // @ts-expect-error — arbitrary strings are rejected.
      expect(() => sdk.identify('player-3', 'not-a-real-type' as string)).toThrow();

      sdk.shutdown();
    });

    it('rejects invalid identityType in alias at compile time', () => {
      const sdk = createSDK({ consent: 'full' });

      // Valid.
      sdk.alias(
        { id: 'steam-id', identityType: 'steam' },
        { id: 'email|passport-id', identityType: 'passport' },
      );

      // @ts-expect-error — 'facebook' is not a valid IdentityType.
      expect(() => sdk.alias(
        { id: 'fb-id', identityType: 'facebook' },
        { id: 'email|passport-id', identityType: 'passport' },
      )).toThrow();

      sdk.shutdown();
    });
  });

  describe('setConsent', () => {
    it('throws for an unrecognised consent level', async () => {
      const sdk = createSDK({ consent: 'none' });

      expect(() => sdk.setConsent('bogus' as never)).toThrow(/unrecognised level/);
      expect(document.cookie).not.toContain(`${COOKIE_NAME}=`);

      sdk.shutdown();
    });

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

      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      sdk.track('purchase', { currency: 'USD', value: 9.99 });
      await sdk.flush();

      const trackMsg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );
      expect(trackMsg).toBeDefined();
      expect(trackMsg.userId).toBe(TEST_USER.id);

      sdk.shutdown();
    });

    it('starts queue when upgrading from none', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();
      expect(sentMessages()).toHaveLength(0);

      sdk.setConsent('anonymous');
      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();

      const signUp = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'sign_up',
      );
      expect(signUp).toBeDefined();

      sdk.shutdown();
    });

    it('keeps queued identify/alias and userId intact on downgrade to anonymous', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(TEST_USER.id, TEST_USER.identityType);
      sdk.alias(TEST_STEAM, TEST_USER);
      sdk.track('purchase', { currency: 'USD', value: 9.99 });

      sdk.setConsent('anonymous');
      await sdk.flush();

      // Events captured under full consent are not mutated by the downgrade:
      // identify/alias stay queued and the purchase keeps its userId + level.
      const msgs = sentMessages();
      expect(msgs.some((m: any) => m.type === 'identify')).toBe(true);
      expect(msgs.some((m: any) => m.type === 'alias')).toBe(true);
      const trackMsg = msgs.find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );
      expect(trackMsg).toBeDefined();
      expect(trackMsg.userId).toBe(TEST_USER.id);
      expect(trackMsg.consentLevel).toBe('full');

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
    it('is safe to call twice (React strict mode)', async () => {
      const sdk = createSDK({ consent: 'full' });
      sdk.shutdown();

      await Promise.resolve();
      await Promise.resolve();
      fetchCalls.length = 0;

      expect(() => sdk.shutdown()).not.toThrow();
      await Promise.resolve();
      await Promise.resolve();

      expect(sentMessages()).toHaveLength(0);
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

      sdk.identify(TEST_USER.id, TEST_USER.identityType);
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

    it('works at none consent without creating cookies', () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.reset();
      expect(document.cookie).not.toContain(`${COOKIE_NAME}=`);
      expect(document.cookie).not.toContain(`${SESSION_COOKIE}=`);

      sdk.shutdown();
    });
  });

  describe('onError wire-through', () => {
    it('invokes config.onError with an AudienceError when a flush fails', async () => {
      mockFetch.mockImplementationOnce(
        async (url: string, init?: RequestInit) => {
          fetchCalls.push({ url, init: init ?? {} });
          return { ok: false, status: 500, json: async () => ({}) };
        },
      );

      const errors: any[] = [];
      const sdk = createSDK({
        consent: 'anonymous',
        onError: (err: any) => errors.push(err),
      });

      sdk.page();
      await sdk.flush();

      expect(errors).toHaveLength(1);
      expect(errors[0].name).toBe('AudienceError');
      expect(errors[0].code).toBe('FLUSH_FAILED');
      expect(errors[0].status).toBe(500);
      expect(errors[0].endpoint).toContain(INGEST_PATH);

      sdk.shutdown();
    });

    it('invokes config.onError with an AudienceError when consent sync fails', async () => {
      mockFetch.mockImplementation(
        async (url: string, init?: RequestInit) => {
          fetchCalls.push({ url, init: init ?? {} });
          if (url.includes(CONSENT_PATH)) {
            return { ok: false, status: 503, json: async () => ({}) };
          }
          return { ok: true, json: async () => ({}) };
        },
      );

      const errors: any[] = [];
      const sdk = createSDK({
        consent: 'none',
        onError: (err: any) => errors.push(err),
      });

      sdk.setConsent('anonymous');

      // Yield for the fire-and-forget consent PUT to resolve
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(errors).toHaveLength(1);
      expect(errors[0].name).toBe('AudienceError');
      expect(errors[0].code).toBe('CONSENT_SYNC_FAILED');
      expect(errors[0].status).toBe(503);
      expect(errors[0].endpoint).toContain(CONSENT_PATH);

      sdk.shutdown();
    });
  });

  describe('deleteData', () => {
    it('sends DELETE to /v1/audience/data?userId=... when userId is supplied', async () => {
      const sdk = createSDK({ consent: 'full' });
      await sdk.deleteData('user-123');

      const deleteCalls = fetchCalls.filter((c) => c.init.method === 'DELETE');
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0].url).toContain(DATA_PATH);
      expect(deleteCalls[0].url).toContain('userId=user-123');
      expect(deleteCalls[0].init.headers).toMatchObject({
        'x-immutable-publishable-key': 'pk_imapik-test-local',
      });

      sdk.shutdown();
    });

    it('sends DELETE to /v1/audience/data?anonymousId=... when no userId is supplied', async () => {
      const sdk = createSDK({ consent: 'anonymous' });
      const anon = sdk.getAnonymousId();

      await sdk.deleteData();

      const deleteCalls = fetchCalls.filter((c) => c.init.method === 'DELETE');
      expect(deleteCalls).toHaveLength(1);
      expect(deleteCalls[0].url).toContain(DATA_PATH);
      expect(deleteCalls[0].url).toContain(`anonymousId=${encodeURIComponent(anon)}`);

      sdk.shutdown();
    });

    it('is a no-op when no userId supplied and no anonymousId cookie exists', async () => {
      // consent: none means no cookie is ever written
      const sdk = createSDK({ consent: 'none' });
      await sdk.deleteData();

      const deleteCalls = fetchCalls.filter((c) => c.init.method === 'DELETE');
      expect(deleteCalls).toHaveLength(0);

      sdk.shutdown();
    });

    it('fires onError with DATA_DELETE_FAILED when the request returns non-2xx', async () => {
      mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
        fetchCalls.push({ url, init: init ?? {} });
        if (url.includes(DATA_PATH)) {
          return { ok: false, status: 500, json: async () => ({}) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const errors: any[] = [];
      const sdk = createSDK({
        consent: 'full',
        onError: (err: any) => errors.push(err),
      });

      await sdk.deleteData('user-123');

      expect(errors).toHaveLength(1);
      expect(errors[0].name).toBe('AudienceError');
      expect(errors[0].code).toBe('DATA_DELETE_FAILED');
      expect(errors[0].status).toBe(500);
      expect(errors[0].endpoint).toContain(DATA_PATH);

      sdk.shutdown();
    });

    it('fires onError with DATA_DELETE_FAILED on network error', async () => {
      mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
        fetchCalls.push({ url, init: init ?? {} });
        if (url.includes(DATA_PATH)) throw new TypeError('Failed to fetch');
        return { ok: true, json: async () => ({}) };
      });

      const errors: any[] = [];
      const sdk = createSDK({
        consent: 'full',
        onError: (err: any) => errors.push(err),
      });

      await sdk.deleteData('user-123');

      expect(errors).toHaveLength(1);
      expect(errors[0].name).toBe('AudienceError');
      expect(errors[0].code).toBe('DATA_DELETE_FAILED');
      expect(errors[0].status).toBe(0);
      expect(errors[0].cause).toBeInstanceOf(TypeError);

      sdk.shutdown();
    });
  });

  describe('GPC/DNT enforcement', () => {
    afterEach(() => {
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true });
    });

    it('blocks setConsent upgrade and tracks gpc_consent_overridden when GPC is active', () => {
      const sdk = createSDK({ consent: 'none' });
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });

      sdk.setConsent('anonymous');

      expect(sdk.getAnonymousId()).toBeDefined();
      // Consent stays at none — no events should be sent
      sdk.page();
      expect(sentMessages()).toHaveLength(0);
      const expected = {
        signal: 'gpc', requestedLevel: 'anonymous', context: 'runtime', publishableKey: 'pk_imapik-test-local',
      };
      expect(track).toHaveBeenCalledWith('audience', 'gpc_consent_overridden', expected);

      sdk.shutdown();
    });

    it('logs a console warning via debug when GPC blocks setConsent', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const sdk = createSDK({ consent: 'none', debug: true });
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });

      sdk.setConsent('full');

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('GPC or DNT signal active'));
      warnSpy.mockRestore();
      sdk.shutdown();
    });

    it('does not block setConsent when GPC is not active', async () => {
      const sdk = createSDK({ consent: 'none' });
      sdk.setConsent('anonymous');
      sdk.track('sign_up', { method: 'email' });
      await sdk.flush();
      const msg = sentMessages().find((m: any) => m.eventName === 'sign_up');
      expect(msg).toBeDefined();
      sdk.shutdown();
    });
  });

  describe('autocapture', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('captures outbound link clicks standalone, same as pixel', async () => {
      const sdk = createSDK();

      const link = document.createElement('a');
      link.href = 'https://store.steampowered.com/app/12345';
      link.textContent = 'Wishlist on Steam';
      document.body.appendChild(link);

      link.dispatchEvent(new Event('click', { bubbles: true }));
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'link_clicked',
      );
      expect(msg).toBeDefined();
      expect(msg.properties).toMatchObject({
        link_url: 'https://store.steampowered.com/app/12345',
        outbound: true,
      });

      sdk.shutdown();
    });

    it('captures form submissions standalone, same as pixel', async () => {
      const sdk = createSDK();

      const form = document.createElement('form');
      form.action = '/signup';
      document.body.appendChild(form);
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'form_submitted',
      );
      expect(msg).toBeDefined();

      sdk.shutdown();
    });

    it('is a no-op at none consent', async () => {
      const sdk = createSDK({ consent: 'none' });

      const link = document.createElement('a');
      link.href = 'https://store.steampowered.com/app/12345';
      link.textContent = 'Steam';
      document.body.appendChild(link);
      link.dispatchEvent(new Event('click', { bubbles: true }));
      await sdk.flush();

      expect(sentMessages().filter((m: any) => m.eventName === 'link_clicked')).toHaveLength(0);
      sdk.shutdown();
    });

    it('respects the autocapture config option (e.g. disabling clicks)', async () => {
      const sdk = createSDK({ autocapture: { clicks: false } });

      const link = document.createElement('a');
      link.href = 'https://store.steampowered.com/app/12345';
      link.textContent = 'Steam';
      document.body.appendChild(link);
      link.dispatchEvent(new Event('click', { bubbles: true }));
      await sdk.flush();

      expect(sentMessages().filter((m: any) => m.eventName === 'link_clicked')).toHaveLength(0);
      sdk.shutdown();
    });

    it('tears down listeners on shutdown', async () => {
      const sdk = createSDK();
      sdk.shutdown();
      fetchCalls.length = 0;

      const link = document.createElement('a');
      link.href = 'https://store.steampowered.com/app/12345';
      link.textContent = 'Steam';
      document.body.appendChild(link);
      link.dispatchEvent(new Event('click', { bubbles: true }));

      expect(sentMessages().filter((m: any) => m.eventName === 'link_clicked')).toHaveLength(0);
    });
  });
});
