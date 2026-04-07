import type { ConsentTransport } from './consent';
import { ConsentManager } from './consent';

function createMockTransport(): ConsentTransport & { calls: any[] } {
  const calls: any[] = [];
  return {
    calls,
    async syncConsent(url, publishableKey, body) {
      calls.push({ url, publishableKey, body });
    },
  };
}

describe('ConsentManager', () => {
  it('initialises with the provided consent level', () => {
    const transport = createMockTransport();
    const manager = new ConsentManager('sandbox', 'pk_test', 'anonymous', 'TestSDK', transport);
    expect(manager.getLevel()).toBe('anonymous');
  });

  it('calls onPurgeQueue and onClearIdentity when downgrading to none', () => {
    const transport = createMockTransport();
    const manager = new ConsentManager('sandbox', 'pk_test', 'full', 'TestSDK', transport);
    const onPurge = jest.fn();
    const onClear = jest.fn();

    manager.setLevel('none', 'anon-123', {
      onPurgeQueue: onPurge,
      onClearIdentity: onClear,
    });

    expect(onPurge).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalled();
    expect(manager.getLevel()).toBe('none');
  });

  it('calls onStripIdentity when downgrading from full to anonymous', () => {
    const transport = createMockTransport();
    const manager = new ConsentManager('sandbox', 'pk_test', 'full', 'TestSDK', transport);
    const onStrip = jest.fn();

    manager.setLevel('anonymous', 'anon-123', { onStripIdentity: onStrip });

    expect(onStrip).toHaveBeenCalled();
    expect(manager.getLevel()).toBe('anonymous');
  });

  it('does not call onStripIdentity when upgrading from anonymous to full', () => {
    const transport = createMockTransport();
    const manager = new ConsentManager('sandbox', 'pk_test', 'anonymous', 'TestSDK', transport);
    const onStrip = jest.fn();

    manager.setLevel('full', 'anon-123', { onStripIdentity: onStrip });

    expect(onStrip).not.toHaveBeenCalled();
    expect(manager.getLevel()).toBe('full');
  });

  it('syncs consent to server via transport on setLevel', () => {
    const transport = createMockTransport();
    const manager = new ConsentManager('sandbox', 'pk_test', 'none', 'TestSDK', transport);
    manager.setLevel('full', 'anon-123');

    expect(transport.calls).toHaveLength(1);
    expect(transport.calls[0]).toEqual({
      url: 'https://api.sandbox.immutable.com/v1/audience/tracking-consent',
      publishableKey: 'pk_test',
      body: {
        anonymousId: 'anon-123',
        status: 'full',
        source: 'TestSDK',
      },
    });
  });

  it('truncates source to 128 characters', () => {
    const transport = createMockTransport();
    const longSource = 'x'.repeat(200);
    const manager = new ConsentManager('sandbox', 'pk_test', 'none', longSource, transport);
    manager.setLevel('full', 'anon-123');

    expect(transport.calls[0].body.source).toHaveLength(128);
  });

  it('uses correct base URL per environment', () => {
    const devTransport = createMockTransport();
    const devManager = new ConsentManager('dev', 'pk_test', 'none', 'SDK', devTransport);
    devManager.setLevel('full', 'anon-123');
    expect(devTransport.calls[0].url).toContain('api.dev.immutable.com');

    const prodTransport = createMockTransport();
    const prodManager = new ConsentManager('production', 'pk_test', 'none', 'SDK', prodTransport);
    prodManager.setLevel('full', 'anon-123');
    expect(prodTransport.calls[0].url).toContain('api.immutable.com');
  });

  it('does not throw when transport rejects', async () => {
    const transport: ConsentTransport = {
      async syncConsent() {
        throw new Error('network error');
      },
    };
    const manager = new ConsentManager('sandbox', 'pk_test', 'none', 'SDK', transport);

    // Should not throw — fire-and-forget
    expect(() => manager.setLevel('full', 'anon-123')).not.toThrow();

    // Let the rejected promise settle
    await Promise.resolve();
    await Promise.resolve();
  });
});
