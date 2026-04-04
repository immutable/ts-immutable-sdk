import { MessageQueue } from './utils/queue';
import type { Transport } from './utils/transport';
import type { Message } from './types';
import * as storage from './utils/storage';

jest.mock('./utils/storage');

const mockStorage = storage as jest.Mocked<typeof storage>;

const stubMessage = (overrides: Partial<Message> = {}): Message => ({
  type: 'track',
  event: 'test_event',
  properties: {},
  anonymousId: 'anon-1',
  timestamp: '2025-01-01T00:00:00.000Z',
  messageId: 'msg-1',
  context: { library: '@imtbl/audience', libraryVersion: '0.0.0' },
  ...overrides,
});

const createTransport = (result = true): jest.Mocked<Transport> => ({
  send: jest.fn().mockResolvedValue(result),
});

const createQueue = (transport?: jest.Mocked<Transport>, opts?: { flushSize?: number }) => {
  const t = transport ?? createTransport();
  const q = new MessageQueue(t, 'https://api.test/v1/audience/events', 'pk_imx_test', 60_000, opts?.flushSize ?? 100);
  return { queue: q, transport: t };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.getItem.mockReturnValue(undefined);
});

describe('MessageQueue', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('restores persisted messages from storage on construction', () => {
    const persisted = [stubMessage()];
    mockStorage.getItem.mockReturnValue(persisted);

    const { queue, transport } = createQueue();
    queue.flush();

    expect(transport.send).toHaveBeenCalledWith(
      expect.any(String),
      'pk_imx_test',
      expect.objectContaining({ messages: persisted }),
    );
  });

  it('persists messages to storage on enqueue', () => {
    const { queue } = createQueue();
    const msg = stubMessage();

    queue.enqueue(msg);

    expect(mockStorage.setItem).toHaveBeenCalledWith('queue', [msg]);
  });

  it('sends all queued messages on flush', async () => {
    const { queue, transport } = createQueue();
    queue.enqueue(stubMessage({ messageId: 'a' }));
    queue.enqueue(stubMessage({ messageId: 'b' }));

    await queue.flush();

    expect(transport.send).toHaveBeenCalledTimes(1);
    expect(transport.send).toHaveBeenCalledWith(
      'https://api.test/v1/audience/events',
      'pk_imx_test',
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ messageId: 'a' }),
          expect.objectContaining({ messageId: 'b' }),
        ]),
      }),
    );
  });

  it('clears sent messages from storage after successful flush', async () => {
    const { queue } = createQueue();
    queue.enqueue(stubMessage());

    await queue.flush();

    expect(mockStorage.setItem).toHaveBeenLastCalledWith('queue', []);
  });

  it('retains messages when transport fails', async () => {
    const transport = createTransport(false);
    const { queue } = createQueue(transport);
    queue.enqueue(stubMessage());

    await queue.flush();

    // Messages should NOT have been cleared — next flush retries
    const lastPersist = mockStorage.setItem.mock.calls
      .filter(([key]) => key === 'queue')
      .pop();
    expect(lastPersist![1]).toHaveLength(1);
  });

  it('auto-flushes when queue reaches flushSize', () => {
    const transport = createTransport();
    const { queue } = createQueue(transport, { flushSize: 2 });

    queue.enqueue(stubMessage({ messageId: 'a' }));
    expect(transport.send).not.toHaveBeenCalled();

    queue.enqueue(stubMessage({ messageId: 'b' }));
    expect(transport.send).toHaveBeenCalledTimes(1);
  });

  it('does nothing when flushing an empty queue', async () => {
    const { queue, transport } = createQueue();

    await queue.flush();

    expect(transport.send).not.toHaveBeenCalled();
  });

  it('prevents concurrent flushes', async () => {
    const transport = createTransport();
    // Make send hang until we resolve it
    let resolveSend!: (v: boolean) => void;
    transport.send.mockReturnValue(new Promise((r) => { resolveSend = r; }));

    const { queue } = createQueue(transport);
    queue.enqueue(stubMessage());

    const first = queue.flush();
    const second = queue.flush();

    resolveSend(true);
    await first;
    await second;

    expect(transport.send).toHaveBeenCalledTimes(1);
  });

  it('clear() empties the queue and removes from storage', () => {
    const { queue } = createQueue();
    queue.enqueue(stubMessage());

    queue.clear();

    expect(mockStorage.removeItem).toHaveBeenCalledWith('queue');
  });
});
