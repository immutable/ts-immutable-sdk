import { MessageQueue } from './queue';
import type { Transport } from './transport';
import type { TrackMessage } from './types';
import * as storage from './storage';

function makeMessage(id: string): TrackMessage {
  return {
    type: 'track',
    eventName: `event_${id}`,
    anonymousId: 'anon-1',
    messageId: id,
    eventTimestamp: new Date().toISOString(),
    surface: 'web',
    context: { library: 'test', libraryVersion: '0.0.0' },
  };
}

function mockTransport(succeed = true): Transport {
  return { send: jest.fn().mockResolvedValue(succeed) };
}

afterEach(() => {
  storage.removeItem('queue');
});

describe('MessageQueue', () => {
  it('enqueues messages and flushes them', async () => {
    const transport = mockTransport();
    const queue = new MessageQueue(transport, '/test', 'pk_test', 5000, 20);

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));
    await queue.flush();

    expect(transport.send).toHaveBeenCalledTimes(1);
    const payload = (transport.send as jest.Mock).mock.calls[0][2];
    expect(payload.messages).toHaveLength(2);
    expect(queue.length).toBe(0);
  });

  it('does not flush when queue is empty', async () => {
    const transport = mockTransport();
    const queue = new MessageQueue(transport, '/test', 'pk_test', 5000, 20);

    await queue.flush();
    expect(transport.send).not.toHaveBeenCalled();
  });

  it('keeps messages on failed send', async () => {
    const transport = mockTransport(false);
    const queue = new MessageQueue(transport, '/test', 'pk_test', 5000, 20);

    queue.enqueue(makeMessage('1'));
    await queue.flush();

    expect(queue.length).toBe(1);
  });

  it('auto-flushes when reaching batch size', async () => {
    const transport = mockTransport();
    const queue = new MessageQueue(transport, '/test', 'pk_test', 60000, 3);

    queue.enqueue(makeMessage('1'));
    queue.enqueue(makeMessage('2'));
    queue.enqueue(makeMessage('3'));

    // Give the auto-flush a tick to resolve
    await new Promise((r) => setTimeout(r, 10));
    expect(transport.send).toHaveBeenCalledTimes(1);
  });

  it('persists messages to localStorage', () => {
    const transport = mockTransport();
    const queue = new MessageQueue(transport, '/test', 'pk_test', 5000, 20);

    queue.enqueue(makeMessage('1'));

    const stored = storage.getItem<unknown[]>('queue');
    expect(stored).toHaveLength(1);
  });

  it('restores messages from localStorage on construction', () => {
    storage.setItem('queue', [makeMessage('1'), makeMessage('2')]);

    const transport = mockTransport();
    const queue = new MessageQueue(transport, '/test', 'pk_test', 5000, 20);

    expect(queue.length).toBe(2);
  });

  it('clears all messages and storage', () => {
    const transport = mockTransport();
    const queue = new MessageQueue(transport, '/test', 'pk_test', 5000, 20);

    queue.enqueue(makeMessage('1'));
    queue.clear();

    expect(queue.length).toBe(0);
    expect(storage.getItem('queue')).toBeUndefined();
  });

  it('prevents concurrent flushes', async () => {
    const transport: Transport = {
      send: jest.fn().mockImplementation(
        () => new Promise((r) => setTimeout(() => r(true), 50)),
      ),
    };
    const queue = new MessageQueue(transport, '/test', 'pk_test', 5000, 20);

    queue.enqueue(makeMessage('1'));

    const flush1 = queue.flush();
    const flush2 = queue.flush();
    await Promise.all([flush1, flush2]);

    expect(transport.send).toHaveBeenCalledTimes(1);
  });
});
