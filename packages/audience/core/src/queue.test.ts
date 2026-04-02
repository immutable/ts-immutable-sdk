import { MessageQueue } from './queue';
import type { Transport } from './transport';
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

function createQueue(
  transport: Transport,
  opts: { flushIntervalMs?: number; flushSize?: number } = {},
) {
  return new MessageQueue(
    transport,
    'https://api.immutable.com/v1/audience/messages',
    'pk_imx_test',
    opts.flushIntervalMs ?? 5_000,
    opts.flushSize ?? 20,
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
    const send = jest.fn().mockResolvedValue(true);
    const queue = createQueue({ send });

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));

    await queue.flush();

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][2].messages).toHaveLength(2);
    expect(queue.length).toBe(0);
  });

  it('retains messages on failed flush', async () => {
    const send = jest.fn().mockResolvedValue(false);
    const queue = createQueue({ send });

    queue.enqueue(makeMessage('1'));
    await queue.flush();

    expect(queue.length).toBe(1);
  });

  it('flushes automatically when batch size is reached', async () => {
    const send = jest.fn().mockResolvedValue(true);
    const queue = createQueue({ send }, { flushSize: 2 });

    queue.enqueue(makeMessage('1'));
    expect(send).not.toHaveBeenCalled();

    queue.enqueue(makeMessage('2'));
    // flush is async — await the microtask
    await Promise.resolve();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('flushes on timer interval', async () => {
    const send = jest.fn().mockResolvedValue(true);
    const queue = createQueue({ send }, { flushIntervalMs: 1_000 });

    queue.start();
    queue.enqueue(makeMessage('1'));

    jest.advanceTimersByTime(1_000);
    // flush is async
    await Promise.resolve();
    expect(send).toHaveBeenCalledTimes(1);

    queue.stop();
  });

  it('persists messages to localStorage', () => {
    const send = jest.fn().mockResolvedValue(true);
    const queue = createQueue({ send });

    queue.enqueue(makeMessage('1'));

    const stored = JSON.parse(localStorage.getItem('__imtbl_audience_queue')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].messageId).toBe('1');
  });

  it('restores messages from localStorage on construction', () => {
    storage.setItem('queue', [makeMessage('restored')]);

    const send = jest.fn().mockResolvedValue(true);
    const queue = createQueue({ send });

    expect(queue.length).toBe(1);
  });

  it('does not flush concurrently', async () => {
    let resolveFirst: () => void;
    const firstCall = new Promise<boolean>((r) => { resolveFirst = () => r(true); });
    const send = jest.fn()
      .mockReturnValueOnce(firstCall)
      .mockResolvedValue(true);

    const queue = createQueue({ send });
    queue.enqueue(makeMessage('1'));

    const flush1 = queue.flush();
    const flush2 = queue.flush(); // should no-op

    resolveFirst!();
    await flush1;
    await flush2;

    expect(send).toHaveBeenCalledTimes(1);
  });

  it('clears all messages and storage', () => {
    const send = jest.fn().mockResolvedValue(true);
    const queue = createQueue({ send });

    queue.enqueue(makeMessage('1'));
    queue.clear();

    expect(queue.length).toBe(0);
    expect(localStorage.getItem('__imtbl_audience_queue')).toBeNull();
  });

  it('handles messages enqueued during flush', async () => {
    let queue: ReturnType<typeof createQueue>;
    const send = jest.fn().mockImplementation(async () => {
      // Simulate a message arriving during the network request
      queue.enqueue(makeMessage('late'));
      return true;
    });

    queue = createQueue({ send });
    queue.enqueue(makeMessage('1'));

    await queue.flush();

    // The original message was sent, but the late one should remain
    expect(queue.length).toBe(1);
  });
});
