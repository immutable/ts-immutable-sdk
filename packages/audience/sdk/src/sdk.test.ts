/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MessageQueue,
  createConsentManager,
  deleteCookie,
} from '@imtbl/audience-core';
import { ImmutableAudienceSDK } from './sdk';

// Mock core modules
jest.mock('@imtbl/audience-core', () => {
  const actual = jest.requireActual('@imtbl/audience-core');

  const mockQueue = {
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
    enqueue: jest.fn(),
    flush: jest.fn(),
    flushUnload: jest.fn(),
    purge: jest.fn(),
    transform: jest.fn(),
    clear: jest.fn(),
    get length() { return 0; },
  };

  let consentLevel = 'none';
  const mockConsent = {
    get level() { return consentLevel as 'none' | 'anonymous' | 'full'; },
    setLevel: jest.fn((next: string) => { consentLevel = next; }),
  };

  return {
    ...actual,
    MessageQueue: jest.fn(() => mockQueue),
    createConsentManager: jest.fn(() => {
      consentLevel = 'none';
      return mockConsent;
    }),
    getOrCreateAnonymousId: jest.fn(() => 'anon-123'),
    getOrCreateSession: jest.fn(() => ({ sessionId: 'sess-456', isNew: false })),
    collectAttribution: jest.fn(() => ({})),
    deleteCookie: jest.fn(),
    httpTransport: { send: jest.fn() },
    generateId: actual.generateId,
    getTimestamp: actual.getTimestamp,
    getBaseUrl: actual.getBaseUrl,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

function createSDK(overrides: Record<string, any> = {}) {
  return new ImmutableAudienceSDK({
    publishableKey: 'pk_test',
    environment: 'sandbox',
    ...overrides,
  });
}

describe('ImmutableAudienceSDK', () => {
  it('initialises with default consent none', () => {
    createSDK();
    expect(createConsentManager).toHaveBeenCalledWith(
      expect.anything(),
      'pk_test',
      'anon-123',
      'sandbox',
      'none',
    );
  });

  it('initialises with provided consent level', () => {
    createSDK({ consent: 'full' });
    expect(createConsentManager).toHaveBeenCalledWith(
      expect.anything(),
      'pk_test',
      'anon-123',
      'sandbox',
      'full',
    );
  });

  it('starts the queue on construction', () => {
    createSDK();
    const queue = (MessageQueue as jest.Mock).mock.results[0].value;
    expect(queue.start).toHaveBeenCalled();
  });

  it('does not enqueue when consent is none', () => {
    const sdk = createSDK();
    const queue = (MessageQueue as jest.Mock).mock.results[0].value;

    sdk.page();
    sdk.track('click');

    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('enqueues page event when consent allows', () => {
    const sdk = createSDK({ consent: 'anonymous' });
    const consent = (createConsentManager as jest.Mock).mock.results[0].value;
    consent.setLevel('anonymous');
    const queue = (MessageQueue as jest.Mock).mock.results[0].value;

    sdk.page({ section: 'shop' });

    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'page',
        surface: 'web',
        anonymousId: 'anon-123',
      }),
    );
  });

  it('enqueues track event with eventName', () => {
    const sdk = createSDK({ consent: 'anonymous' });
    const consent = (createConsentManager as jest.Mock).mock.results[0].value;
    consent.setLevel('anonymous');
    const queue = (MessageQueue as jest.Mock).mock.results[0].value;

    sdk.track('purchase', { value: 9.99 });

    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'track',
        eventName: 'purchase',
      }),
    );
  });

  it('only allows identify at full consent', () => {
    const sdk = createSDK();
    const consent = (createConsentManager as jest.Mock).mock.results[0].value;
    const queue = (MessageQueue as jest.Mock).mock.results[0].value;

    consent.setLevel('anonymous');
    sdk.identify('user-1', { name: 'Test' });
    expect(queue.enqueue).not.toHaveBeenCalled();

    consent.setLevel('full');
    sdk.identify('user-1', { name: 'Test' });
    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'identify',
        userId: 'user-1',
      }),
    );
  });

  it('clears cookies when consent set to none', () => {
    const sdk = createSDK();
    const consent = (createConsentManager as jest.Mock).mock.results[0].value;
    consent.setLevel('full');

    sdk.setConsent('none');

    expect(consent.setLevel).toHaveBeenCalledWith('none');
    expect(deleteCookie).toHaveBeenCalledTimes(2);
  });

  it('destroys queue on destroy', () => {
    const sdk = createSDK();
    const queue = (MessageQueue as jest.Mock).mock.results[0].value;

    sdk.destroy();
    expect(queue.destroy).toHaveBeenCalled();

    sdk.track('late-event');
    expect(queue.enqueue).not.toHaveBeenCalled();
  });
});
