import { Audience } from './audience';
import { AudienceEvent, IdentityProvider } from './events';
import * as storage from './utils/storage';
import * as runtime from './utils/runtime';
import * as transport from './utils/transport';
import type { MessageContext, BatchPayload } from './types';

jest.mock('./utils/storage');
jest.mock('./utils/runtime');
jest.mock('./utils/transport', () => ({
  httpTransport: { send: jest.fn().mockResolvedValue(true) },
}));

const mockStorage = storage as jest.Mocked<typeof storage>;
const mockRuntime = runtime as jest.Mocked<typeof runtime>;

const stubContext: MessageContext = {
  library: '@imtbl/audience',
  libraryVersion: '0.0.0',
};

let sendMock: jest.Mock;
let lastPayload: () => BatchPayload | undefined;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockStorage.getItem.mockReturnValue(undefined);
  mockRuntime.collectContext.mockReturnValue(stubContext);

  sendMock = transport.httpTransport.send as jest.Mock;
  sendMock.mockResolvedValue(true);

  lastPayload = () => {
    if (sendMock.mock.calls.length > 0) return sendMock.mock.calls[0][2] as BatchPayload;
    return undefined;
  };
});

afterEach(() => {
  jest.useRealTimers();
});

const createAudience = () => new Audience({
  publishableKey: 'pk_imx_test',
  environment: 'sandbox',
});

describe('Audience', () => {
  describe('track()', () => {
    it('enqueues a track message with eventName and properties', async () => {
      const audience = createAudience();
      audience.track(AudienceEvent.Purchase, { currency: 'USD', value: 9.99 });

      await audience.flush();

      expect(sendMock.mock.calls[0][1]).toBe('pk_imx_test');
      const payload = lastPayload()!;
      expect(payload.messages).toHaveLength(1);
      expect(payload.messages[0]).toMatchObject({
        type: 'track',
        eventName: 'purchase',
        properties: { currency: 'USD', value: 9.99 },
      });
    });

    it('includes userId on track messages after identify', async () => {
      const audience = createAudience();
      audience.identify(IdentityProvider.Passport, 'abc-123');
      audience.track(AudienceEvent.SignIn, { method: 'passport' });

      await audience.flush();

      const trackMsg = lastPayload()!.messages.find((m) => m.type === 'track');
      expect(trackMsg).toMatchObject({ userId: 'abc-123' });
    });

    it('sends track messages without userId when not identified', async () => {
      const audience = createAudience();
      audience.track(AudienceEvent.SessionStart, {});

      await audience.flush();

      const msg = lastPayload()!.messages[0];
      expect(msg).toMatchObject({ type: 'track' });
      expect((msg as any).userId).toBeUndefined();
    });

    it('includes surface when configured', async () => {
      const audience = new Audience({
        publishableKey: 'pk_imx_test',
        environment: 'sandbox',
        surface: 'web',
      });
      audience.track(AudienceEvent.SessionStart, {});
      await audience.flush();

      const msg = lastPayload()!.messages[0];
      expect((msg as any).surface).toBe('web');
    });

    it('omits surface when not configured', async () => {
      const audience = createAudience();
      audience.track(AudienceEvent.SessionStart, {});
      await audience.flush();

      const msg = lastPayload()!.messages[0];
      expect((msg as any).surface).toBeUndefined();
    });

    it('uses eventTimestamp instead of timestamp', async () => {
      const audience = createAudience();
      audience.track(AudienceEvent.SessionStart, {});

      await audience.flush();

      const msg = lastPayload()!.messages[0];
      expect(msg.eventTimestamp).toBeDefined();
      expect((msg as any).timestamp).toBeUndefined();
    });
  });

  describe('identify()', () => {
    it('enqueues an identify message with userId, identityType and traits', async () => {
      const audience = createAudience();
      audience.identify(IdentityProvider.Steam, '765', { email: 'p@test.com' });

      await audience.flush();

      expect(lastPayload()!.messages[0]).toMatchObject({
        type: 'identify',
        userId: '765',
        identityType: 'steam',
        traits: { email: 'p@test.com' },
      });
    });

    it('persists userId to storage', () => {
      const audience = createAudience();
      audience.identify(IdentityProvider.Passport, 'abc-123');

      expect(mockStorage.setItem).toHaveBeenCalledWith('userId', 'abc-123');
    });

    it('persists identityType to storage', () => {
      const audience = createAudience();
      audience.identify(IdentityProvider.Steam, '765');

      expect(mockStorage.setItem).toHaveBeenCalledWith('identityType', 'steam');
    });
  });

  describe('alias()', () => {
    it('enqueues an alias message with fromId/fromType/toId/toType', async () => {
      const audience = createAudience();
      audience.alias(
        { provider: IdentityProvider.Steam, uid: '765' },
        { provider: IdentityProvider.Passport, uid: 'abc-123' },
      );

      await audience.flush();

      expect(lastPayload()!.messages[0]).toMatchObject({
        type: 'alias',
        fromId: '765',
        fromType: 'steam',
        toId: 'abc-123',
        toType: 'passport',
      });
    });

    it('does not include old field names', async () => {
      const audience = createAudience();
      audience.alias(
        { provider: IdentityProvider.Steam, uid: '765' },
        { provider: IdentityProvider.Passport, uid: 'abc-123' },
      );

      await audience.flush();

      const msg = lastPayload()!.messages[0] as any;
      expect(msg.previousId).toBeUndefined();
      expect(msg.previousProvider).toBeUndefined();
    });
  });

  describe('anonymousId', () => {
    it('generates and persists an anonymousId on first init', () => {
      createAudience();

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'anonymousId',
        expect.any(String),
      );
    });

    it('reuses a previously-persisted anonymousId', () => {
      mockStorage.getItem.mockImplementation(
        (key) => (key === 'anonymousId' ? ('existing-anon' as any) : undefined),
      );

      createAudience();

      const anonIdCalls = mockStorage.setItem.mock.calls.filter(
        ([k]) => k === 'anonymousId',
      );
      expect(anonIdCalls[0][1]).toBe('existing-anon');
    });

    it('attaches anonymousId to every message', async () => {
      const audience = createAudience();
      audience.track(AudienceEvent.SessionStart, {});
      audience.identify(IdentityProvider.Passport, 'abc-123');
      audience.alias(
        { provider: IdentityProvider.Steam, uid: '765' },
        { provider: IdentityProvider.Passport, uid: 'abc-123' },
      );

      await audience.flush();

      for (const msg of lastPayload()!.messages) {
        expect(msg.anonymousId).toBeDefined();
        expect(typeof msg.anonymousId).toBe('string');
      }
    });
  });

  describe('reset()', () => {
    it('clears the userId so subsequent tracks are anonymous', async () => {
      const audience = createAudience();
      audience.identify(IdentityProvider.Passport, 'abc-123');
      audience.reset();
      audience.track(AudienceEvent.SessionStart, {});

      await audience.flush();

      const trackMsg = lastPayload()!.messages.find((m) => m.type === 'track');
      expect((trackMsg as any).userId).toBeUndefined();
    });
  });

  describe('environment routing', () => {
    it('sends to sandbox URL', async () => {
      const audience = new Audience({ publishableKey: 'pk_imx_test', environment: 'sandbox' });
      audience.track(AudienceEvent.SessionStart, {});
      await audience.flush();

      expect(sendMock.mock.calls[0][0]).toBe(
        'https://api.sandbox.immutable.com/v1/audience/messages',
      );
    });

    it('sends to production URL', async () => {
      const audience = new Audience({ publishableKey: 'pk_imx_test', environment: 'production' });
      audience.track(AudienceEvent.SessionStart, {});
      await audience.flush();

      expect(sendMock.mock.calls[0][0]).toBe(
        'https://api.immutable.com/v1/audience/messages',
      );
    });

    it('sends to dev URL', async () => {
      const audience = new Audience({ publishableKey: 'pk_imx_test', environment: 'dev' });
      audience.track(AudienceEvent.SessionStart, {});
      await audience.flush();

      expect(sendMock.mock.calls[0][0]).toBe(
        'https://api.dev.immutable.com/v1/audience/messages',
      );
    });
  });
});
