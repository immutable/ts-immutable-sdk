import {
  AudienceError, TransportError, toAudienceError,
} from './errors';

describe('AudienceError', () => {
  it('is an instance of Error', () => {
    const err = new AudienceError({
      code: 'FLUSH_FAILED',
      message: 'flush failed',
      status: 500,
      endpoint: 'https://example.com',
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AudienceError);
    expect(err.name).toBe('AudienceError');
  });

  it('exposes structured fields from init', () => {
    const cause = new TypeError('boom');
    const err = new AudienceError({
      code: 'NETWORK_ERROR',
      message: 'network down',
      status: 0,
      endpoint: 'https://example.com',
      responseBody: { detail: 'x' },
      cause,
    });

    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.message).toBe('network down');
    expect(err.status).toBe(0);
    expect(err.endpoint).toBe('https://example.com');
    expect(err.responseBody).toEqual({ detail: 'x' });
    expect(err.cause).toBe(cause);
  });
});

describe('toAudienceError', () => {
  const httpError = new TransportError({
    status: 500,
    endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
    body: { code: 'INTERNAL_ERROR' },
  });

  const networkError = new TransportError({
    status: 0,
    endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
    cause: new TypeError('Failed to fetch'),
  });

  describe('flush source', () => {
    it('maps HTTP error to FLUSH_FAILED with status in message', () => {
      const err = toAudienceError(httpError, 'flush', 5);

      expect(err.code).toBe('FLUSH_FAILED');
      expect(err.message).toBe('Flush failed with status 500');
      expect(err.status).toBe(500);
      expect(err.endpoint).toBe(httpError.endpoint);
      expect(err.responseBody).toEqual({ code: 'INTERNAL_ERROR' });
    });

    it('maps network error to NETWORK_ERROR with batch count in message', () => {
      const err = toAudienceError(networkError, 'flush', 5);

      expect(err.code).toBe('NETWORK_ERROR');
      expect(err.message).toBe('Network error sending 5 messages');
      expect(err.status).toBe(0);
      expect(err.cause).toBe(networkError.cause);
    });

    it('falls back to count 0 in network message when count is undefined', () => {
      const err = toAudienceError(networkError, 'flush');
      expect(err.message).toBe('Network error sending 0 messages');
    });
  });

  describe('consent source', () => {
    it('maps HTTP error to CONSENT_SYNC_FAILED with status in message', () => {
      const err = toAudienceError(
        { ...httpError, endpoint: 'https://api.dev.immutable.com/v1/audience/tracking-consent' },
        'consent',
      );

      expect(err.code).toBe('CONSENT_SYNC_FAILED');
      expect(err.message).toBe('Consent sync failed with status 500');
    });

    it('maps network error to NETWORK_ERROR with consent-specific message', () => {
      const err = toAudienceError(networkError, 'consent');

      expect(err.code).toBe('NETWORK_ERROR');
      expect(err.message).toBe('Network error syncing consent');
      expect(err.status).toBe(0);
      expect(err.cause).toBe(networkError.cause);
    });
  });

  describe('partial-rejection (2xx with rejected > 0)', () => {
    it('maps to VALIDATION_REJECTED with backend body preserved', () => {
      const partialError = new TransportError({
        status: 200,
        endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
        body: { accepted: 50, rejected: 50 },
      });

      const err = toAudienceError(partialError, 'flush', 100);

      expect(err.code).toBe('VALIDATION_REJECTED');
      expect(err.status).toBe(200);
      expect(err.message).toBe('Backend rejected 50 of 100 messages');
      expect(err.responseBody).toEqual({ accepted: 50, rejected: 50 });
    });

    it('handles missing accepted/rejected fields gracefully', () => {
      const partialError = new TransportError({
        status: 200,
        endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
        body: {},
      });

      const err = toAudienceError(partialError, 'flush');

      expect(err.code).toBe('VALIDATION_REJECTED');
      expect(err.message).toBe('Backend rejected 0 of 0 messages');
    });
  });
});
