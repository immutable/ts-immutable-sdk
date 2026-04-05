import type { Message } from '@imtbl/audience-core';
import { MessageQueue } from './queue';
import * as transport from './transport';

jest.mock('./transport', () => ({
  sendMessages: jest.fn().mockResolvedValue(true),
}));

const mockSend = transport.sendMessages as jest.MockedFunction<typeof transport.sendMessages>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    type: 'track',
    messageId: `msg-${Math.random()}`,
    eventTimestamp: new Date().toISOString(),
    anonymousId: 'anon-1',
    context: { library: '@imtbl/audience-web-sdk', libraryVersion: '0.1.0' },
    eventName: 'test',
    surface: 'web',
    ...overrides,
  } as Message;
}

describe('MessageQueue', () => {
  it('enqueues and flushes messages', async () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    queue.enqueue(makeMessage());
    queue.enqueue(makeMessage());

    await queue.flush();

    expect(mockSend).toHaveBeenCalledTimes(1);
    const payload = mockSend.mock.calls[0][2];
    expect(payload.messages).toHaveLength(2);
  });

  it('auto-flushes when reaching flushSize', () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 3);

    queue.enqueue(makeMessage());
    queue.enqueue(makeMessage());
    expect(mockSend).not.toHaveBeenCalled();

    queue.enqueue(makeMessage()); // triggers flush at size 3
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('flushes on timer interval', () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 1000, 100);
    queue.start();

    queue.enqueue(makeMessage());
    jest.advanceTimersByTime(1000);

    expect(mockSend).toHaveBeenCalledTimes(1);
    queue.stop();
  });

  it('does not flush when empty', async () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    await queue.flush();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('retains messages on failed flush', async () => {
    mockSend.mockResolvedValueOnce(false);
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    queue.enqueue(makeMessage());

    await queue.flush();
    expect(queue.length).toBe(1); // still in queue

    mockSend.mockResolvedValueOnce(true);
    await queue.flush();
    expect(queue.length).toBe(0); // now drained
  });

  it('clears all messages', () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    queue.enqueue(makeMessage());
    queue.enqueue(makeMessage());
    expect(queue.length).toBe(2);

    queue.clear();
    expect(queue.length).toBe(0);
  });

  it('purges messages matching a predicate', () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    queue.enqueue(makeMessage({ type: 'track' } as any));
    queue.enqueue(makeMessage({ type: 'identify' } as any));
    queue.enqueue(makeMessage({ type: 'track' } as any));

    queue.purge((m) => m.type === 'identify');
    expect(queue.length).toBe(2);
  });

  it('transforms messages in place', async () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    queue.enqueue(makeMessage({ userId: 'should-strip' } as any));

    queue.transform((m) => {
      const cleaned = { ...m };
      delete (cleaned as any).userId;
      return cleaned;
    });

    await queue.flush();
    const msg = mockSend.mock.calls[0][2].messages[0];
    expect((msg as any).userId).toBeUndefined();
  });

  it('calls onFlush callback', async () => {
    const onFlush = jest.fn();
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20, onFlush);
    queue.enqueue(makeMessage());

    await queue.flush();
    expect(onFlush).toHaveBeenCalledWith(true, 1);
  });

  it('persists messages to localStorage', () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    queue.enqueue(makeMessage());

    const stored = localStorage.getItem('__imtbl_audience_queue');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toHaveLength(1);
  });

  it('restores messages from localStorage on construction', () => {
    // Pre-populate storage
    const msg = makeMessage();
    localStorage.setItem('__imtbl_audience_queue', JSON.stringify([msg]));

    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    expect(queue.length).toBe(1);
  });

  it('flushUnload sends with keepalive', () => {
    const queue = new MessageQueue('https://test.com/messages', 'pk_test', 5000, 20);
    queue.enqueue(makeMessage());

    queue.flushUnload();

    expect(mockSend).toHaveBeenCalledWith(
      'https://test.com/messages',
      'pk_test',
      expect.objectContaining({ messages: expect.any(Array) }),
      true, // keepalive
    );
    expect(queue.length).toBe(0);
  });
});
