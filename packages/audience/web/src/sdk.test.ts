import { ImmutableWebSDK } from './sdk';

function createSDK(overrides: Record<string, unknown> = {}) {
  return ImmutableWebSDK.init({
    publishableKey: 'pk_imtbl_test',
    environment: 'sandbox',
    consent: 'full',
    ...overrides,
  });
}

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
    .filter((c) => c.url.includes('/v1/audience/messages'))
    .flatMap((c) => {
      try {
        return JSON.parse(c.init.body as string).messages;
      } catch {
        return [];
      }
    });
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
  jest.useRealTimers();
});

describe('ImmutableWebSDK', () => {
  describe('init', () => {
    it('creates an SDK instance via static init()', () => {
      const sdk = createSDK();
      expect(sdk).toBeInstanceOf(ImmutableWebSDK);
      sdk.shutdown();
    });

    it('sets consent cookie on init', () => {
      const sdk = createSDK({ consent: 'anonymous' });
      expect(document.cookie).toContain('_imtbl_consent=anonymous');
      sdk.shutdown();
    });

    it('creates anonymous ID cookie when consent allows', () => {
      const sdk = createSDK({ consent: 'anonymous' });
      expect(document.cookie).toContain('imtbl_anon_id=');
      sdk.shutdown();
    });

    it('does not create identity cookies at none consent', () => {
      const sdk = createSDK({ consent: 'none' });
      expect(document.cookie).toContain('_imtbl_consent=none');
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
      expect(msg.context.library).toBe('@imtbl/audience-web-sdk');

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

      sdk.identify('user@example.com', 'email', {
        name: 'Player One',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'identify',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBe('user@example.com');
      expect(msg.identityType).toBe('email');
      expect(msg.traits).toEqual({ name: 'Player One' });

      sdk.shutdown();
    });

    it('is a no-op at anonymous consent', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.identify('user@example.com', 'email');
      await sdk.flush();

      const ids = sentMessages().filter(
        (m: any) => m.type === 'identify',
      );
      expect(ids).toHaveLength(0);
      sdk.shutdown();
    });

    it('sends anonymous identify with traits only', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify({
        source: 'steam',
        steamId: '76561198012345',
      });
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'identify',
      );
      expect(msg).toBeDefined();
      expect(msg.userId).toBeUndefined();
      expect(msg.traits).toEqual({
        source: 'steam',
        steamId: '76561198012345',
      });

      sdk.shutdown();
    });

    it('includes userId on subsequent track calls', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify('player42', 'steam');
      sdk.track('purchase', { currency: 'USD', value: 9.99 });
      await sdk.flush();

      const trackMsg = sentMessages().find(
        (m: any) => m.type === 'track' && m.eventName === 'purchase',
      );
      expect(trackMsg).toBeDefined();
      expect(trackMsg.userId).toBe('player42');

      sdk.shutdown();
    });
  });

  describe('alias', () => {
    it('sends alias with fromId/fromType/toId/toType', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.alias(
        { uid: '76561198012345', provider: 'steam' },
        { uid: 'user@example.com', provider: 'email' },
      );
      await sdk.flush();

      const msg = sentMessages().find(
        (m: any) => m.type === 'alias',
      );
      expect(msg).toBeDefined();
      expect(msg.fromId).toBe('76561198012345');
      expect(msg.fromType).toBe('steam');
      expect(msg.toId).toBe('user@example.com');
      expect(msg.toType).toBe('email');

      sdk.shutdown();
    });
  });

  describe('setConsent', () => {
    it('starts queue when upgrading from none', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();
      expect(sentMessages()).toHaveLength(0);

      sdk.setConsent('anonymous');
      sdk.track('sign_up', { method: 'google' });
      await sdk.flush();

      const tracks = sentMessages().filter(
        (m: any) => m.type === 'track',
      );
      expect(tracks.length).toBeGreaterThan(0);

      sdk.shutdown();
    });

    it('purges identify/alias, strips userId on downgrade', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify('user@example.com', 'email');
      sdk.alias(
        { uid: '76561198012345', provider: 'steam' },
        { uid: 'user@example.com', provider: 'email' },
      );
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

    it('alias requires full consent, not anonymous', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.alias(
        { uid: '76561198012345', provider: 'steam' },
        { uid: 'user@example.com', provider: 'email' },
      );
      await sdk.flush();

      const aliases = sentMessages().filter(
        (m: any) => m.type === 'alias',
      );
      expect(aliases).toHaveLength(0);
      sdk.shutdown();
    });
  });

  describe('reset', () => {
    it('clears userId and generates new anonymousId', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.track('sign_in', { method: 'passport' });
      await sdk.flush();
      const originalAnonId = sentMessages().find(
        (m: any) => m.type === 'track',
      )?.anonymousId;
      fetchCalls.length = 0;

      sdk.identify('user@example.com', 'email');
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
  });
});
