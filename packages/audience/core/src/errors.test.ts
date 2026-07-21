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

    it('parses per-message rejections from the response body', () => {
      const rejections = [
        { messageId: 'msg-1', errors: [{ field: 'surface', code: 'INVALID_ENUM', message: 'invalid surface' }] },
      ];
      const partialError = new TransportError({
        status: 200,
        endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
        body: { accepted: 1, rejected: 1, rejections },
      });

      const err = toAudienceError(partialError, 'flush', 2);

      expect(err.rejections).toEqual(rejections);
    });

    it('leaves rejections undefined when the body has none', () => {
      const partialError = new TransportError({
        status: 200,
        endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
        body: { accepted: 1, rejected: 0 },
      });

      const err = toAudienceError(partialError, 'flush', 1);

      expect(err.rejections).toBeUndefined();
    });

    it('leaves rejections undefined when the body is malformed', () => {
      const partialError = new TransportError({
        status: 200,
        endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
        body: { rejections: 'not-an-array' },
      });

      const err = toAudienceError(partialError, 'flush', 1);

      expect(err.rejections).toBeUndefined();
    });

    it('skips a malformed element instead of throwing, keeping the well-formed ones', () => {
      const partialError = new TransportError({
        status: 200,
        endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
        body: {
          rejections: [
            { messageId: 'msg-1' }, // missing errors
            { errors: [{ field: 'x', code: 'Y', message: 'z' }] }, // missing messageId
            'not-an-object',
            { messageId: 'msg-2', errors: [{ field: 'surface', code: 'INVALID_ENUM', message: 'bad' }] },
          ],
        },
      });

      const err = toAudienceError(partialError, 'flush', 4);

      expect(err.rejections).toEqual([
        { messageId: 'msg-1', errors: [] },
        { messageId: 'msg-2', errors: [{ field: 'surface', code: 'INVALID_ENUM', message: 'bad' }] },
      ]);
    });
  });

  describe('4xx (non-429) validation-rejected', () => {
    const rejectedBody = {
      success: false,
      accepted: 0,
      rejected: 1,
      rejections: [
        { messageId: 'msg-1', errors: [{ field: 'eventName', code: 'MISSING_REQUIRED_FIELD', message: 'required' }] },
      ],
    };

    it('parses rejections for a flush-source 4xx', () => {
      const badRequestError = new TransportError({
        status: 400,
        endpoint: 'https://api.dev.immutable.com/v1/audience/messages',
        body: rejectedBody,
      });

      const err = toAudienceError(badRequestError, 'flush', 1);

      expect(err.code).toBe('VALIDATION_REJECTED');
      expect(err.rejections).toEqual(rejectedBody.rejections);
    });

    it('does not parse rejections for a consent-source 4xx (different response shape)', () => {
      const badRequestError = new TransportError({
        status: 400,
        endpoint: 'https://api.dev.immutable.com/v1/audience/tracking-consent',
        body: rejectedBody,
      });

      const err = toAudienceError(badRequestError, 'consent');

      expect(err.code).toBe('CONSENT_SYNC_FAILED');
      expect(err.rejections).toBeUndefined();
    });
  });
});
