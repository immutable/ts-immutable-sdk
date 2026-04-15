import type { ImmutableAudienceGlobal } from './cdn';

describe('cdn entry point', () => {
  beforeEach(() => {
    delete (globalThis as unknown as { ImmutableAudience?: unknown }).ImmutableAudience;
    jest.resetModules();
  });

  afterEach(() => {
    delete (globalThis as unknown as { ImmutableAudience?: unknown }).ImmutableAudience;
  });

  it('attaches the SDK surface to window.ImmutableAudience', async () => {
    await import('./cdn');
    const g = (globalThis as unknown as {
      ImmutableAudience?: ImmutableAudienceGlobal;
    }).ImmutableAudience;

    expect(g).toBeDefined();
    expect(typeof g!.init).toBe('function');
    expect(typeof g!.AudienceEvents).toBe('object');
    expect(typeof g!.canTrack).toBe('function');
    expect(typeof g!.canIdentify).toBe('function');
    expect(g!.IdentityType.Passport).toBe('passport');
    expect(g!.IdentityType.Steam).toBe('steam');
    expect(g!.IdentityType.Custom).toBe('custom');
    expect(typeof g!.version).toBe('string');
    expect(g!.version.length).toBeGreaterThan(0);

    const err = new g!.AudienceError({
      code: 'NETWORK_ERROR',
      message: 'test',
      status: 0,
      endpoint: 'https://example.com',
    });
    expect(err).toBeInstanceOf(Error);
  });

  it('does not overwrite a pre-existing global', async () => {
    const sentinel = { Audience: 'FAKE' };
    (globalThis as unknown as { ImmutableAudience?: unknown }).ImmutableAudience = sentinel;

    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await import('./cdn');

    expect(
      (globalThis as unknown as { ImmutableAudience?: unknown }).ImmutableAudience,
    ).toBe(sentinel);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('loaded twice'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Remove the old <script> tag'));
    warn.mockRestore();
  });
});
