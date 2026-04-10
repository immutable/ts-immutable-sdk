import { createLoader, Command } from './loader';

beforeEach(() => {
  delete (window as Record<string, unknown>).__imtbl;
});

describe('createLoader', () => {
  it('installs on window.__imtbl', () => {
    const handler = jest.fn();
    const loader = createLoader(handler);

    expect((window as Record<string, unknown>).__imtbl).toBe(loader);
    expect(loader._loaded).toBe(true);
  });

  it('forwards push() calls to the handler', () => {
    const handler = jest.fn();
    const loader = createLoader(handler);

    loader.push(['init', { key: 'pk_123' }]);
    loader.push(['page', { url: '/home' }]);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith(['init', { key: 'pk_123' }]);
    expect(handler).toHaveBeenCalledWith(['page', { url: '/home' }]);
  });

  it('replays queued commands from the stub array', () => {
    // Simulate the snippet having pushed commands before the script loaded
    const stub: Command[] = [
      ['init', { key: 'pk_abc' }],
      ['consent', 'anonymous'],
    ];
    (window as Record<string, unknown>).__imtbl = stub;

    const handler = jest.fn();
    createLoader(handler);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, ['init', { key: 'pk_abc' }]);
    expect(handler).toHaveBeenNthCalledWith(2, ['consent', 'anonymous']);
  });

  it('replays queued commands then handles new pushes', () => {
    (window as Record<string, unknown>).__imtbl = [['init', { key: 'pk_1' }]];

    const handler = jest.fn();
    const loader = createLoader(handler);

    // Queued command replayed
    expect(handler).toHaveBeenCalledTimes(1);

    // New command via push
    loader.push(['page', { url: '/about' }]);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenLastCalledWith(['page', { url: '/about' }]);
  });

  it('handles empty window.__imtbl gracefully', () => {
    (window as Record<string, unknown>).__imtbl = [];
    const handler = jest.fn();
    createLoader(handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('handles undefined window.__imtbl gracefully', () => {
    const handler = jest.fn();
    createLoader(handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple commands in a single push call', () => {
    const handler = jest.fn();
    const loader = createLoader(handler);

    loader.push(['init', { key: 'pk_1' }], ['consent', 'full']);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
