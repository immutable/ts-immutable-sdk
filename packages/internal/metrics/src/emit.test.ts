import {
  configure,
  getRuntimeId,
  isTelemetryEnabled,
  resetClientForTests,
} from './client';
import { track } from './emit';
import { resetTransportForTests } from './transport';

const flushSends = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

const decodePayload = (fetchMock: jest.Mock) => {
  const [, options] = fetchMock.mock.calls[0];
  const body = JSON.parse(options.body);
  return JSON.parse(Buffer.from(body.payload, 'base64').toString('utf-8'));
};

describe('@imtbl/metrics', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    resetClientForTests();
    resetTransportForTests();
    fetchMock.mockReset();
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
    });
  });

  it('maps the slim track API to the legacy v1 wire envelope', async () => {
    configure({ clientId: 'client-123' });
    track('passport', 'login');
    await flushSends();

    const payload = decodePayload(fetchMock);
    expect(payload).toEqual({
      version: 1,
      data: {
        details: {
          rid: getRuntimeId(),
          sdkVersion: expect.any(String),
          passportClientId: 'client-123',
        },
        events: [{
          event: 'passport.login',
          time: expect.any(String),
        }],
      },
    });
    expect(payload.data.details.env).toBeUndefined();
    expect(payload.data.details.uid).toBeUndefined();
    expect(Number.isNaN(Date.parse(payload.data.events[0].time))).toBe(false);
  });

  it('maps durationMs and redacted error onto v1 properties', async () => {
    const error = Object.assign(new Error('secret'), {
      name: 'PassportError',
      type: 'AUTHENTICATION_ERROR',
      stack: 'Error: secret\n    at foo',
    });
    track('passport', 'login', { durationMs: 15.7, error });
    await flushSends();

    const payload = decodePayload(fetchMock);
    expect(payload.data.events[0]).toEqual({
      event: 'passport.trackError_login',
      time: expect.any(String),
      properties: [
        ['durationMs', '16'],
        ['isTrackError', 'true'],
        ['errorName', 'PassportError'],
        ['errorCode', 'AUTHENTICATION_ERROR'],
      ],
    });
    expect(JSON.stringify(payload)).not.toContain('secret');
  });

  it('does not drop duplicate events', async () => {
    track('passport', 'login');
    track('passport', 'login');
    await flushSends();

    expect(decodePayload(fetchMock).data.events).toHaveLength(2);
  });

  it('disables after 5xx and makes later track a no-op', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503, statusText: 'down' });
    track('passport', 'a');
    await flushSends();

    expect(isTelemetryEnabled()).toBe(false);
    track('passport', 'b');
    await flushSends();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('disables on 204 retirement', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204 });
    track('passport', 'retire');
    await flushSends();

    expect(isTelemetryEnabled()).toBe(false);
  });
});
