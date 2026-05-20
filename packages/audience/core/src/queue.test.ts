import { MessageQueue } from './queue';
import type { HttpSend } from './transport';
import { TransportError, type AudienceError, type TransportResult } from './errors';
import type { Message } from './types';
import * as storage from './storage';

function makeMessage(id: string): Message {
  return {
    type: 'track',
    messageId: id,
    eventTimestamp: '2026-04-01T00:00:00.000Z',
    anonymousId: 'anon-1',
    surface: 'web',
    context: { library: '@imtbl/audience', libraryVersion: '0.0.0' },
    eventName: 'test',
  };
}

const okResult: TransportResult = { ok: true };
const failResult: TransportResult = {
  ok: false,
  error: new TransportError({
    status: 500,
    endpoint: 'https://example.com',
    body: null,
  }),
};

interface QueueOpts {
  flushIntervalMs?: number;
  flushSize?: number;
  onFlush?: (ok: boolean, count: number) => void;
  onError?: (err: AudienceError) => void;
  staleFilter?: (msg: Message) => boolean;
}

function createQueue(
  send: HttpSend,
  opts: QueueOpts = {},
) {
  return new MessageQueue(
    send,
    'pk_imapik-test-local',
    {
      flushIntervalMs: opts.flushIntervalMs,
      flushSize: opts.flushSize,
      onFlush: opts.onFlush,
      onError: opts.onError,
      staleFilter: opts.staleFilter,
    },
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('MessageQueue', () => {
  it('enqueues messages and flushes them', async () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));

    await queue.flush();

    expect(send).toHaveBeenCalledTimes(1);
    expect((send.mock.calls[0][2] as { messages: Message[] }).messages).toHaveLength(2);
    expect(queue.length).toBe(0);
  });

  it('retains messages on failed flush', async () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(failResult);
    const queue = createQueue(send);

    queue.enqueue(makeMessage('1'));
    await queue.flush();

    expect(queue.length).toBe(1);
  });

  it('flushes automatically when batch size is reached', async () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send, { flushSize: 2 });

    queue.enqueue(makeMessage('1'));
    expect(send).not.toHaveBeenCalled();

    queue.enqueue(makeMessage('2'));
    // flush is async — await the microtask
    await Promise.resolve();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('flushes on timer interval', async () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send, { flushIntervalMs: 1_000 });

    queue.start();
    queue.enqueue(makeMessage('1'));

    jest.advanceTimersByTime(1_000);
    // flush is async
    await Promise.resolve();
    expect(send).toHaveBeenCalledTimes(1);

    queue.stop();
  });

  it('persists messages to localStorage', () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);

    queue.enqueue(makeMessage('1'));

    const stored = JSON.parse(localStorage.getItem('__imtbl_audience_queue')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].messageId).toBe('1');
  });

  it('restores messages from localStorage on construction', () => {
    storage.setItem('queue', [makeMessage('restored')]);

    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);

    expect(queue.length).toBe(1);
  });

  it('filters stale messages on restore', () => {
    storage.setItem('queue', [makeMessage('stale'), makeMessage('fresh')]);

    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send, {
      staleFilter: (m) => m.messageId === 'fresh',
    });

    expect(queue.length).toBe(1);
  });

  it('does not flush concurrently', async () => {
    let resolveFirst: () => void;
    const firstCall = new Promise<TransportResult>((r) => { resolveFirst = () => r(okResult); });
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>()
      .mockReturnValueOnce(firstCall)
      .mockResolvedValue(okResult);

    const queue = createQueue(send);
    queue.enqueue(makeMessage('1'));

    const flush1 = queue.flush();
    const flush2 = queue.flush(); // should no-op

    resolveFirst!();
    await flush1;
    await flush2;

    expect(send).toHaveBeenCalledTimes(1);
  });

  it('clears all messages and storage', () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);

    queue.enqueue(makeMessage('1'));
    queue.clear();

    expect(queue.length).toBe(0);
    expect(localStorage.getItem('__imtbl_audience_queue')).toBeNull();
  });

  it('handles messages enqueued during flush', async () => {
    let queue: ReturnType<typeof createQueue>;
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockImplementation(async () => {
      queue.enqueue(makeMessage('late'));
      return okResult;
    });

    queue = createQueue(send);
    queue.enqueue(makeMessage('1'));

    await queue.flush();

    expect(queue.length).toBe(1);
  });

  it('calls onFlush callback', async () => {
    const onFlush = jest.fn();
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send, { onFlush });

    queue.enqueue(makeMessage('1'));
    await queue.flush();

    expect(onFlush).toHaveBeenCalledWith(true, 1);
  });

  it('fires onError with mapped AudienceError on flush failure', async () => {
    const onError = jest.fn();
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
      ok: false,
      error: new TransportError({
        status: 500, endpoint: 'https://api.immutable.com/v1/audience/messages', body: null,
      }),
    });
    const queue = createQueue(send, { onError });

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));
    await queue.flush();

    expect(onError).toHaveBeenCalledTimes(1);
    const err = onError.mock.calls[0][0];
    expect(err.code).toBe('FLUSH_FAILED');
    expect(err.status).toBe(500);
    expect(err.message).toBe('Flush failed with status 500');
  });

  it('fires onError with NETWORK_ERROR on network failure', async () => {
    const onError = jest.fn();
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
      ok: false,
      error: new TransportError({
        status: 0,
        endpoint: 'https://api.immutable.com/v1/audience/messages',
        cause: new TypeError('Failed to fetch'),
      }),
    });
    const queue = createQueue(send, { onError });

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));
    queue.enqueue(makeMessage('3'));
    await queue.flush();

    expect(onError).toHaveBeenCalledTimes(1);
    const err = onError.mock.calls[0][0];
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.message).toBe('Network error sending 3 messages');
  });

  it('does not fire onError on successful flush', async () => {
    const onError = jest.fn();
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send, { onError });

    queue.enqueue(makeMessage('1'));
    await queue.flush();

    expect(onError).not.toHaveBeenCalled();
  });

  it('swallows exceptions thrown from the onError callback', async () => {
    const onError = jest.fn().mockImplementation(() => { throw new Error('callback boom'); });
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(failResult);
    const queue = createQueue(send, { onError });

    queue.enqueue(makeMessage('1'));
    await expect(queue.flush()).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalled();
  });

  it('drops batch and fires VALIDATION_REJECTED when backend reports partial rejection', async () => {
    // Backend rejected one message in a batch of two. The 200 OK response
    // body says { accepted: 1, rejected: 1 }. Expected behaviour:
    //   - Queue clears the batch (retrying validation failures won't help).
    //   - onError fires with code 'VALIDATION_REJECTED' so studios are aware.
    //   - Bug fix: previously the queue checked only result.ok and dropped
    //     the entire batch silently, losing rejected messages with no signal.
    const onError = jest.fn();
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
      ok: false,
      error: new TransportError({
        status: 200,
        endpoint: 'https://api.immutable.com/v1/audience/messages',
        body: { accepted: 1, rejected: 1 },
      }),
    });
    const queue = createQueue(send, { onError });

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));
    await queue.flush();

    expect(queue.length).toBe(0);
    expect(onError).toHaveBeenCalledTimes(1);
    const err = onError.mock.calls[0][0];
    expect(err.code).toBe('VALIDATION_REJECTED');
    expect(err.status).toBe(200);
    expect(err.responseBody).toEqual({ accepted: 1, rejected: 1 });
  });

  it('purges messages matching a predicate', () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);

    queue.enqueue(makeMessage('1'));
    queue.enqueue({ ...makeMessage('2'), type: 'identify' } as any);
    queue.enqueue(makeMessage('3'));

    queue.purge((m) => m.type === 'identify');
    expect(queue.length).toBe(2);
  });

  it('transforms messages in place', async () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);

    queue.enqueue({ ...makeMessage('1'), userId: 'should-strip' } as any);

    queue.transform((m) => {
      const cleaned = { ...m };
      delete (cleaned as any).userId;
      return cleaned;
    });

    await queue.flush();
    const msg = (send.mock.calls[0][2] as { messages: Message[] }).messages[0];
    expect((msg as any).userId).toBeUndefined();
  });
});

describe('exponential backoff', () => {
  it('skips flush while inside the backoff window', async () => {
    const start = 1_000_000;
    jest.setSystemTime(start);
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(failResult);
    const queue = createQueue(send);

    queue.enqueue(makeMessage('1'));

    // First flush — records failure, sets backoff to start+5000
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(1);

    // Still inside backoff window — flush is a no-op
    jest.setSystemTime(start + 4_999);
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(1);

    // Past backoff window — flush proceeds
    jest.setSystemTime(start + 5_001);
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('escalates backoff: 5s → 10s → 20s → 40s → 60s', async () => {
    // Each step: trigger a failure, assert blocked before window, assert unblocked after.
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(failResult);
    const queue = createQueue(send);
    queue.enqueue(makeMessage('1'));

    let now = 1_000_000;
    let calls = 0;

    const step = async (delay: number) => {
      jest.setSystemTime(now);
      await queue.flush();
      calls++;
      expect(send).toHaveBeenCalledTimes(calls);

      jest.setSystemTime(now + delay - 1);
      await queue.flush();
      expect(send).toHaveBeenCalledTimes(calls); // still blocked

      now += delay + 1;
      jest.setSystemTime(now);
    };

    await step(5_000);
    await step(10_000);
    await step(20_000);
    await step(40_000);
    await step(60_000);
  });

  it('resets backoff on a successful flush', async () => {
    const start = 1_000_000;
    jest.setSystemTime(start);
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>()
      .mockResolvedValueOnce(failResult)
      .mockResolvedValue(okResult);
    const queue = createQueue(send);

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));

    // First flush fails — backoff starts
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(1);

    // Advance past the 5s window; second flush succeeds — backoff resets
    jest.setSystemTime(start + 5_001);
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(2);

    // Should be able to flush immediately after reset
    queue.enqueue(makeMessage('3'));
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(3);
  });

  it('uses Retry-After delay when server supplies it on 429', async () => {
    const start = 1_000_000;
    jest.setSystemTime(start);
    const rateLimitResult: TransportResult = {
      ok: false,
      error: new TransportError({ status: 429, endpoint: 'https://api.immutable.com/v1/audience/messages' }),
      retryAfterMs: 30_000,
    };
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>()
      .mockResolvedValueOnce(rateLimitResult)
      .mockResolvedValue(okResult);
    const queue = createQueue(send);

    queue.enqueue(makeMessage('1'));

    await queue.flush();
    expect(send).toHaveBeenCalledTimes(1);

    // 29s — still inside Retry-After window
    jest.setSystemTime(start + 29_000);
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(1);

    // Past the window
    jest.setSystemTime(start + 30_001);
    await queue.flush();
    expect(send).toHaveBeenCalledTimes(2);
    expect(queue.length).toBe(0);
  });

  it('fires RATE_LIMITED via onError on 429 and keeps the batch', async () => {
    const onError = jest.fn();
    const rateLimitResult: TransportResult = {
      ok: false,
      error: new TransportError({ status: 429, endpoint: 'https://api.immutable.com/v1/audience/messages' }),
    };
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(rateLimitResult);
    const queue = createQueue(send, { onError });

    queue.enqueue(makeMessage('1'));
    await queue.flush();

    expect(queue.length).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].code).toBe('RATE_LIMITED');
    expect(onError.mock.calls[0][0].status).toBe(429);
  });
});

describe('4xx drop', () => {
  it('drops batch and fires VALIDATION_REJECTED on non-retryable 4xx', async () => {
    const onError = jest.fn();
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
      ok: false,
      error: new TransportError({
        status: 401,
        endpoint: 'https://api.immutable.com/v1/audience/messages',
        body: 'Unauthorized',
      }),
    });
    const queue = createQueue(send, { onError });

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));
    await queue.flush();

    expect(queue.length).toBe(0);
    expect(onError).toHaveBeenCalledTimes(1);
    const err = onError.mock.calls[0][0];
    expect(err.code).toBe('VALIDATION_REJECTED');
    expect(err.status).toBe(401);
  });

  it('drops batch and fires VALIDATION_REJECTED on 400', async () => {
    const onError = jest.fn();
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue({
      ok: false,
      error: new TransportError({
        status: 400,
        endpoint: 'https://api.immutable.com/v1/audience/messages',
        body: { error: 'bad request' },
      }),
    });
    const queue = createQueue(send, { onError });

    queue.enqueue(makeMessage('1'));
    await queue.flush();

    expect(queue.length).toBe(0);
    expect(onError.mock.calls[0][0].code).toBe('VALIDATION_REJECTED');
    expect(onError.mock.calls[0][0].status).toBe(400);
  });
});

describe('page-unload flush (keepalive)', () => {
  it('flushes via keepalive fetch on visibilitychange to hidden', () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);
    queue.start();

    queue.enqueue(makeMessage('1'));

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(send).toHaveBeenCalledWith(
      'https://api.immutable.com/v1/audience/messages',
      'pk_imapik-test-local',
      expect.objectContaining({ messages: expect.any(Array) }),
      { keepalive: true },
    );
    expect(queue.length).toBe(0);

    queue.stop();
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });
  });

  it('flushes via keepalive fetch on pagehide', () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);
    queue.start();

    queue.enqueue(makeMessage('1'));
    window.dispatchEvent(new Event('pagehide'));

    expect(send).toHaveBeenCalledWith(
      'https://api.immutable.com/v1/audience/messages',
      'pk_imapik-test-local',
      expect.objectContaining({ messages: expect.any(Array) }),
      { keepalive: true },
    );
    expect(queue.length).toBe(0);

    queue.stop();
  });

  it('does not fire unload flush when queue is empty', () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);
    queue.start();

    window.dispatchEvent(new Event('pagehide'));

    expect(send).not.toHaveBeenCalled();

    queue.stop();
  });

  it('removes listeners on stop', () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);
    queue.start();
    queue.stop();

    queue.enqueue(makeMessage('1'));
    window.dispatchEvent(new Event('pagehide'));

    expect(send).not.toHaveBeenCalled();
  });

  it('destroy stops the queue and flushes remaining messages', () => {
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockResolvedValue(okResult);
    const queue = createQueue(send);
    queue.start();

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));
    queue.destroy();

    expect(send).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ messages: expect.any(Array) }),
      { keepalive: true },
    );
    expect(queue.length).toBe(0);

    // Listeners removed — no double flush
    queue.enqueue(makeMessage('3'));
    window.dispatchEvent(new Event('pagehide'));
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('skips unload flush if an async flush is already in flight', async () => {
    let resolveFlush: () => void;
    const flushPromise = new Promise<TransportResult>((r) => { resolveFlush = () => r(okResult); });
    const send = jest.fn<ReturnType<HttpSend>, Parameters<HttpSend>>().mockReturnValueOnce(flushPromise);

    const queue = createQueue(send);
    queue.start();
    queue.enqueue(makeMessage('1'));

    // Start an async flush (sets flushing = true)
    const pending = queue.flush();

    // pagehide fires while async flush is in flight — unload flush should be skipped
    window.dispatchEvent(new Event('pagehide'));
    // Only 1 call (the async flush), no keepalive call
    expect(send).toHaveBeenCalledTimes(1);

    resolveFlush!();
    await pending;
    expect(queue.length).toBe(0);

    queue.stop();
  });
});
