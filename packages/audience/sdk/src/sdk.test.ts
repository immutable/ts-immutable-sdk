import {
  COOKIE_NAME, SESSION_COOKIE, SESSION_START, SESSION_END,
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

    it('emits session_start on new session', async () => {
      const sdk = createSDK({ consent: 'full' });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === SESSION_START,
      );
      expect(msg).toBeDefined();
      expect(msg.properties).toHaveProperty('session_id');

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
      expect(msg.properties).toHaveProperty('session_id');
      expect(msg.properties).toHaveProperty('utm_source', 'youtube');
      expect(msg.properties).toHaveProperty('utm_campaign', 'launch');

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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
        method: 'email',
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
        utm_source: 'google',
        utm_campaign: 'spring',
        touchpoint_type: 'click',
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
        utm_source: 'twitter',
        touchpoint_type: 'click',
        url: 'https://store.com',
        label: 'Buy',
      });

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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
        platform: 'webgl',
      });

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
      // First page merges session-cached attribution (includes landing_page)
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
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

    it('includes sessionId in page properties', async () => {
      const sdk = createSDK();

      sdk.page();
      await sdk.flush();

      const msg = sentMessages().find((m: any) => m.type === 'page');
      expect(msg).toBeDefined();
      expect(msg.properties).toEqual({
        session_id: expect.any(String),
        landing_page: expect.any(String),
      });

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

    it('rejects alias when from and to are identical', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.alias(
        { id: 'same_id', identityType: 'steam' },
        { id: 'same_id', identityType: 'steam' },
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

  describe('identify and alias type narrowing', () => {
    it('rejects invalid identityType at compile time', () => {
      const sdk = createSDK({ consent: 'full' });

      // Valid — should type-check.
      sdk.identify('player-1', 'passport', { plan: 'premium' });

      // @ts-expect-error — 'facebook' is not a valid IdentityType literal.
      sdk.identify('player-2', 'facebook');

      // @ts-expect-error — arbitrary strings are rejected.
      sdk.identify('player-3', 'not-a-real-type' as string);

      sdk.shutdown();
    });

    it('rejects invalid identityType in alias at compile time', () => {
      const sdk = createSDK({ consent: 'full' });

      // Valid.
      sdk.alias(
        { id: 'steam-id', identityType: 'steam' },
        { id: 'passport-id', identityType: 'passport' },
      );

      // @ts-expect-error — 'facebook' is not a valid IdentityType.
      sdk.alias(
        { id: 'fb-id', identityType: 'facebook' },
        { id: 'passport-id', identityType: 'passport' },
      );

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
      expect(sessionStart.properties).toHaveProperty('session_id');

      const signUp = msgs.find(
        (m: any) => m.type === 'track' && m.eventName === 'sign_up',
      );
      expect(signUp).toBeDefined();

      sdk.shutdown();
    });

    it('purges identify/alias, strips userId on downgrade', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify(TEST_USER.id, TEST_USER.identityType);
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
      expect(msg.properties).toHaveProperty('session_id');
      expect(msg.properties.duration).toBe(5);
    });

    it('is safe to call twice (React strict mode)', async () => {
      const sdk = createSDK({ consent: 'full' });
      sdk.shutdown();

      await Promise.resolve();
      await Promise.resolve();
      fetchCalls.length = 0;

      sdk.shutdown();
      await Promise.resolve();
      await Promise.resolve();

      const sessionEnds = sentMessages().filter(
        (m: any) => m.eventName === SESSION_END,
      );
      expect(sessionEnds).toHaveLength(0);
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
      const expected = { signal: 'gpc', requestedLevel: 'anonymous', context: 'runtime' };
      expect(track).toHaveBeenCalledWith('audience', 'gpc_consent_overridden', expected);

      sdk.shutdown();
    });

    it('logs a console warning via debug when GPC blocks setConsent', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const sdk = createSDK({ consent: 'none', debug: true });
      Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });

      sdk.setConsent('full');

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('GPC or DNT detected'));
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
});
