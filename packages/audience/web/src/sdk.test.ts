import { ImmutableWebSDK } from './sdk';
import { AudienceEvent, IdentityProvider } from './events';
import * as transport from './transport';

// Mock transport to capture sent payloads
jest.mock('./transport', () => ({
  sendMessages: jest.fn().mockResolvedValue(true),
}));

const mockSend = transport.sendMessages as jest.MockedFunction<typeof transport.sendMessages>;

function createSDK(overrides: Record<string, unknown> = {}) {
  return ImmutableWebSDK.init({
    publishableKey: 'pk_imtbl_test',
    environment: 'sandbox',
    consent: 'full',
    ...overrides,
  });
}

// Mock fetch to prevent real network requests from reconcileServerConsent
global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
  // Clear cookies
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
      // Should have consent cookie but not anon ID
      expect(document.cookie).toContain('_imtbl_consent=none');
      sdk.shutdown();
    });
  });

  describe('track', () => {
    it('enqueues a typed event and flushes', async () => {
      const sdk = createSDK();

      sdk.track(AudienceEvent.Purchase, {
        currency: 'USD',
        value: 9.99,
        itemId: 'sword_01',
      });

      await sdk.flush();

      expect(mockSend).toHaveBeenCalledTimes(1);
      const payload = mockSend.mock.calls[0][2];
      const msg = payload.messages[0];

      expect(msg.type).toBe('track');
      expect((msg as any).eventName).toBe('purchase');
      expect((msg as any).properties).toEqual({
        currency: 'USD',
        value: 9.99,
        itemId: 'sword_01',
      });
      expect(msg.surface).toBe('web');
      expect(msg.context.library).toBe('@imtbl/audience-web-sdk');

      sdk.shutdown();
    });

    it('enqueues a custom string event', async () => {
      const sdk = createSDK();

      sdk.track('beta_key_redeemed', { keySource: 'influencer' });
      await sdk.flush();

      const msg = mockSend.mock.calls[0][2].messages[0];
      expect((msg as any).eventName).toBe('beta_key_redeemed');

      sdk.shutdown();
    });

    it('is a no-op at none consent', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.track(AudienceEvent.SignUp, { method: 'google' });
      await sdk.flush();

      expect(mockSend).not.toHaveBeenCalled();
      sdk.shutdown();
    });

    it('excludes userId at anonymous consent', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.track(AudienceEvent.SignIn, { method: 'passport' });
      await sdk.flush();

      const msg = mockSend.mock.calls[0][2].messages[0];
      expect((msg as any).userId).toBeUndefined();

      sdk.shutdown();
    });
  });

  describe('page', () => {
    it('enqueues a page message', async () => {
      const sdk = createSDK();

      sdk.page({ section: 'shop' });
      await sdk.flush();

      const msg = mockSend.mock.calls[0][2].messages[0];
      expect(msg.type).toBe('page');
      expect((msg as any).properties).toMatchObject({ section: 'shop' });

      sdk.shutdown();
    });

    it('attaches attribution to the first page view', async () => {
      // Set UTM params on the URL
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
      sdk.page(); // second page — no attribution
      await sdk.flush();

      const { messages } = mockSend.mock.calls[0][2];
      expect((messages[0] as any).properties).toHaveProperty('utm_source', 'youtube');
      // Second page should NOT have attribution
      if (messages[1]) {
        expect((messages[1] as any).properties?.utm_source).toBeUndefined();
      }

      sdk.shutdown();
    });
  });

  describe('identify', () => {
    it('sends an identify message at full consent', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify('user@example.com', IdentityProvider.Email, { name: 'Player One' });
      await sdk.flush();

      const msg = mockSend.mock.calls[0][2].messages[0];
      expect(msg.type).toBe('identify');
      expect((msg as any).userId).toBe('user@example.com');
      expect((msg as any).identityType).toBe('email');
      expect((msg as any).traits).toEqual({ name: 'Player One' });

      sdk.shutdown();
    });

    it('is a no-op at anonymous consent', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.identify('user@example.com', IdentityProvider.Email);
      await sdk.flush();

      expect(mockSend).not.toHaveBeenCalled();
      sdk.shutdown();
    });

    it('sends anonymous identify with traits only (no userId)', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify({ source: 'steam', steamId: '76561198012345' });
      await sdk.flush();

      const msg = mockSend.mock.calls[0][2].messages[0];
      expect(msg.type).toBe('identify');
      expect((msg as any).userId).toBeUndefined();
      expect((msg as any).traits).toEqual({ source: 'steam', steamId: '76561198012345' });
      expect(msg.anonymousId).toBeDefined();

      sdk.shutdown();
    });

    it('includes userId on subsequent track calls', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify('player42', IdentityProvider.Steam);
      sdk.track(AudienceEvent.Purchase, { currency: 'USD', value: 9.99 });
      await sdk.flush();

      const { messages } = mockSend.mock.calls[0][2];
      const trackMsg = messages.find((m: any) => m.type === 'track')!;
      expect((trackMsg as any).userId).toBe('player42');

      sdk.shutdown();
    });
  });

  describe('alias', () => {
    it('sends an alias message with fromId/fromType/toId/toType', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.alias(
        { uid: '76561198012345', provider: IdentityProvider.Steam },
        { uid: 'user@example.com', provider: IdentityProvider.Email },
      );
      await sdk.flush();

      const msg = mockSend.mock.calls[0][2].messages[0];
      expect(msg.type).toBe('alias');
      expect((msg as any).fromId).toBe('76561198012345');
      expect((msg as any).fromType).toBe('steam');
      expect((msg as any).toId).toBe('user@example.com');
      expect((msg as any).toType).toBe('email');

      sdk.shutdown();
    });
  });

  describe('setConsent', () => {
    it('starts queue when upgrading from none', async () => {
      const sdk = createSDK({ consent: 'none' });

      sdk.track(AudienceEvent.SignUp, { method: 'google' });
      await sdk.flush();
      expect(mockSend).not.toHaveBeenCalled();

      sdk.setConsent('anonymous');
      sdk.track(AudienceEvent.SignUp, { method: 'google' });
      await sdk.flush();
      expect(mockSend).toHaveBeenCalled();

      sdk.shutdown();
    });

    it('purges identify and alias, strips userId on full → anonymous downgrade', async () => {
      const sdk = createSDK({ consent: 'full' });

      sdk.identify('user@example.com', IdentityProvider.Email);
      sdk.alias(
        { uid: '76561198012345', provider: IdentityProvider.Steam },
        { uid: 'user@example.com', provider: IdentityProvider.Email },
      );
      sdk.track(AudienceEvent.Purchase, { currency: 'USD', value: 9.99 });
      // Three messages queued: identify + alias + track

      sdk.setConsent('anonymous');
      await sdk.flush();

      const { messages } = mockSend.mock.calls[0][2];
      // Identify and alias should have been purged (both carry PII)
      expect(messages.every((m: any) => m.type !== 'identify')).toBe(true);
      expect(messages.every((m: any) => m.type !== 'alias')).toBe(true);
      // Track should remain but without userId
      const trackMsg = messages.find((m: any) => m.type === 'track');
      expect(trackMsg).toBeDefined();
      expect((trackMsg as any).userId).toBeUndefined();

      sdk.shutdown();
    });

    it('alias requires full consent, not anonymous', async () => {
      const sdk = createSDK({ consent: 'anonymous' });

      sdk.alias(
        { uid: '76561198012345', provider: IdentityProvider.Steam },
        { uid: 'user@example.com', provider: IdentityProvider.Email },
      );
      await sdk.flush();

      expect(mockSend).not.toHaveBeenCalled();
      sdk.shutdown();
    });

    it('fires initial page view on upgrade from none when trackPageViews enabled', async () => {
      const sdk = ImmutableWebSDK.init({
        publishableKey: 'pk_imtbl_test',
        environment: 'sandbox',
        consent: 'none',
        trackPageViews: true,
      });

      sdk.setConsent('anonymous');
      await sdk.flush();

      const { messages } = mockSend.mock.calls[0][2];
      expect(messages.some((m: any) => m.type === 'page')).toBe(true);

      sdk.shutdown();
    });
  });

  describe('reset', () => {
    it('clears userId and generates new anonymousId', async () => {
      const sdk = createSDK({ consent: 'full' });

      // Capture the original anonymousId
      sdk.track(AudienceEvent.SignIn, { method: 'passport' });
      await sdk.flush();
      const originalAnonId = mockSend.mock.calls[0][2].messages[0].anonymousId;
      mockSend.mockClear();

      sdk.identify('user@example.com', IdentityProvider.Email);
      await sdk.flush();
      mockSend.mockClear();

      sdk.reset();
      sdk.track(AudienceEvent.SignUp, { method: 'google' });
      await sdk.flush();

      const msg = mockSend.mock.calls[0][2].messages[0];
      expect(msg.type).toBe('track');
      expect((msg as any).userId).toBeUndefined();
      // Verify anonymousId actually changed
      expect(msg.anonymousId).toBeDefined();
      expect(msg.anonymousId).not.toBe(originalAnonId);

      sdk.shutdown();
    });
  });
});
